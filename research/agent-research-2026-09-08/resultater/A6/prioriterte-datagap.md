# A6 – prioriterte datagap

**Kontrolldato:** 2026-09-08
**Grunnlag:** A1–A5 `data.json`, funn, søkelogger og A6 `samordnet-kunnskap.md`/`rettelseslogg.md`.
**Status:** Internt arbeidsregister. Ikke `human_verified` og ikke publiseringsklart.

## Prioriteringsnøkkel

- **P0:** Blokkerer en hovedpåstand eller en beregning som prosjektet ellers lett kan komme til å overdrive.
- **P1:** Vesentlig for en robust beskrivende analyse, men kan avgrenses eller måles etter at P0 er håndtert.
- **P2:** Nyttig fordypning eller oppfølging; skal ikke forsinke et avgrenset kunnskapsgrunnlag.

Innhentingsmulighet er skilt fra konsekvens: `åpen kilde` betyr at en ny målrettet offentlig kontroll er realistisk; `dataeier` betyr at variabelen sannsynligvis ikke finnes offentlig; `måling` betyr at det kreves prøve, driftsdata eller øvelse; `tilgang` betyr at dokumentet er identifisert, men ikke lesbart; `metodevalg` betyr at flere målinger ikke kan kombineres uten en eksplisitt avgrensning.

## P0 – må lukkes før hovedkonklusjoner

| ID | Spor og gap | Hvorfor det har høy konsekvens | Neste nødvendige innhenting | Innhentingsmulighet / stoppunkt |
|---|---|---|---|---|
| DG-P0-01 | **A1-G001:** fysisk norsk mathvetebeholdning per kontroll­dato, kvalitet, lokasjon, eierskap og rullering. | Uten dette kan 30 000 tonn ved utgangen av 2025 ikke brukes som nåtidsreserve eller lagerdøgn. Mål og kontrakter er ikke beholdning. | Søk etter nyere Landbruksdirektorat-/forvaltningsstatus. Hvis den ikke er offentlig: spesifiser variablene til ansvarlig dataeier, uten å kontakte nå. | `åpen kilde` først; deretter `dataeier`. Stopp ved manglende datert beholdningsregister. |
| DG-P0-02 | **A1-G002/G003/G004/G005/G007/G010:** sammenlignbar mølle- og nedstrømskapasitet, råvare/produkt, faktisk ledig kapasitet, ledetid, emballasje, energi og kobling fra lager til mottaker. | Nodevise tall kan ikke summeres; uten overgangene kan ingen leveranse- eller dekningstidsanalyse forsvares. | Lag et felles node-/variabelskjema og krev samme tidsenhet, vare, systemgrense og status for hver node. Suppler med dokumentert drifts-/avbruddstest der den finnes. | `dataeier` + `måling`. Åpne årsrapporter kan fylle enkeltceller, ikke hele kjeden. |
| DG-P0-03 | **A2-G001/G002/G003/G005/G006:** Aass-spesifikk våtmasse, tørrstoff, tetthet, næringsprofil, mottakerflyt, rasjon, lagring og svinn. | Liter mask er ikke kg tørrstoff, protein eller spart import. Uten disse dataene kan ingen substitusjonseffekt eller kontinuitet beregnes. | Be om et usendt variabelskjema til bryggeri-/fôrfaglig dataeier: målepunkt, prøveantall, periode, enheter, laboratoriemetode, mottakere aggregert, dose og alternativ ingrediens. | `dataeier` og `måling`. Generelle våtmaskforsøk kan bare brukes som metodeinnspill. |
| DG-P0-04 | **A3-G004/G005/G011:** punktestimater, nevner, faktisk N, vekting, usikkerhet og harmonisering for nordisk FIES-sammenligning. | SIFO, FIES, ISSP, prisbekymring og matutdeling er ulike konstruksjoner. En rangering uten felles instrument og år vil være misvisende. | Hent FAO/FIES-datasett eller landmetadata for samme år; dokumenter indikator-ID, kalibrering, design effect/MOE og om tallet er enkeltår eller flerårsgjennomsnitt. | `åpen kilde`/`dataeier`; deretter `metodevalg`. Stopp hvis samme instrument/populasjon ikke kan etableres. |
| DG-P0-05 | **A4-G001/G002/G004/G006/G007:** faktisk islandsk reserve, vare-for-vare beholdning, vedtaksstatus, lagerlokasjon, eierskap og aktuell foredlingskapasitet. | HI/LBHI-tallene er scenarier/anbefalinger. Uten gjennomføringsbevis kan de ikke omtales som etablert nødlagring eller leverbar mat. | Følg siste parlamentariske svar/vedtak og offentlige vedlegg; bygg deretter et aktørregister med produkt, kornslag, kapasitet, dato og driftsstatus. | `åpen kilde` først; `tilgang` hvis rapport/vedlegg ikke kan åpnes; `dataeier`/`måling` for faktisk reserve. |
| DG-P0-06 | **A5-G001/G002/G003/G004/G005/G006/G007:** matspesifikk protokoll, mottakerrett, aktivering, mengde, ledetid, transportkapasitet og demonstrert leveranse. | Avtaleramme, ikke-bindende deklarasjon og generelle korridorer dokumenterer ikke at Norge kan disponere mat fra et annet land under felles sjokk. | Søk i traktat-/regjeringsregistre etter senere protokoller og implementering. Følg eventuell 2027-studie separat fra dagens status; søk etter kontrakt, finansiering, øvelse eller leveransebevis. | `åpen kilde` for rettsstatus; `dataeier`/`metodevalg` for operativ kapasitet. Ikke anta fravær ved manglende offentlig detalj. |

## P1 – vesentlig for analyse og beslutningsgrunnlag

| ID | Spor og gap | Konsekvens | Neste nødvendige innhenting | Innhentingsmulighet |
|---|---|---|---|---|
| DG-P1-01 | **A1-G008/G009:** norskandel og råvare-/melserier med samme teller, nevner og periode; oppdatert kapasitetsgrunnlag. | 34 prosent, 53 prosent og importvolum kan ikke tolkes som samme måling. | Lag en definisjonsmatrise og hent originaltabeller for samme år før eventuell trendanalyse. | `åpen kilde` + `metodevalg`. |
| DG-P1-02 | **A1-G006:** dokumentert kobling fra statlig lageruttak til mølle, mel, pakking, transport og navngitt mottaker under prioritering. | Kommersiell relasjon er ikke det samme som operativ beredskapskjede. | Finn endelig ordningsdokument, uttaksprosedyre, tildelingsregel og eventuell øvelse; behold manglende ledd som gap. | `åpen kilde`/`dataeier`; øvelse er `måling`. |
| DG-P1-03 | **A2-G004:** Aass-relevante mottaker- og dyreutfall, inkludert negativt utfall, dose og alternativ rasjon. | Generelle forsøk sier noe om design, ikke om Aass-effekt i norsk praksis. | Velg et forhåndsdefinert pilot-/observasjonsdesign med kontroll, dose, dyregruppe, periode og avbruddskriterier. | `måling` og `dataeier`; ikke fyll med bransjegjennomsnitt. |
| DG-P1-04 | **A3-G001/G002/G003/G006:** SIFO itemdata/crosswalk, delutvalgs-N, vekter, konfidensintervall og brudd mellom bølger. | SIFO kan beskrives, men ikke uten videre brukes som robust nasjonal prevalens eller panel. | Hent tabeller/metodedokumentasjon fra samme instrument og registrer om bølgene er gjentatte tverrsnitt. | `åpen kilde`/`dataeier`; `metodevalg` ved manglende usikkerhet. |
| DG-P1-05 | **A3-G007/G008/G009/G010:** Finland, Sverige, Fafo/matutdeling og prisproxyer. | Supplerende signaler kan ellers feilaktig bli presentert som samme matsikkerhetsrate. | Lag separate indikatorprofiler med populasjon, instrument, periode og formål; søk etter finsk nasjonal serie med samme instrument. | `åpen kilde`; `metodevalg` hvis ingen kompatibel serie finnes. |
| DG-P1-06 | **A4-G003:** teller, nevner og observasjonsperiode bak Islands «omtrent én prosent». | Påstanden kan ikke brukes som ny ratio eller sammenlignes med nyere lager-/importtall. | Finn original tabell/forutsetning og kompatibel periode; hvis ikke, behold den historiske observasjonen uten ny beregning. | `åpen kilde`/`tilgang`; stopp ved inkompatible systemgrenser. |
| DG-P1-07 | **A4-G005:** samlet register over islandsk matkorn-, fôrkorn-, mel- og tørkeforedling med tillatelse og driftsstatus. | Stenging av én hvetemølle sier ikke om all kornforedling eller leverbar mat. | Kryss offentlige virksomhets-/tillatelsesregistre med operatørens egne kapasitetsdata og dato. | `åpen kilde` for aktører; `dataeier`/`måling` for kapasitet. |
| DG-P1-08 | **A5-G005:** prioriteringsregler når flere nordiske land rammes samtidig og sivile/militære behov konkurrerer. | Korridorbeskrivelse uten prioritering sier lite om faktisk mattilgjengelighet under felles sjokk. | Følg transportstrategiens planlagte kapasitetsanalyse og identifiser scenario, myndighet, prioriteringsregel og avhengighet. | `åpen kilde` for planstatus; `metodevalg` til scenarioet er definert. |

## P2 – senere fordypning

| ID | Spor og gap | Neste nødvendige innhenting | Kategori |
|---|---|---|---|
| DG-P2-01 | Oppdatert full kjede for norsk bakeri-/matprodusent- og distribusjonsledd med volum og rute. | Avgrens én dokumentert kjede og følg den gjennom ordinær og forstyrret drift. | `dataeier`/`måling` |
| DG-P2-02 | Aass-fellesavhengigheter: vann, energi, kjøretøy, silo og alternativ fôrkjede. | Lag avhengighetsregister med eier, reserve, maksimal avbruddstid og teststatus. | `dataeier`/`måling` |
| DG-P2-03 | Islandsk oppfølging etter forslag/vedtak og siste dokumenterte øvelse. | Søk siste vedtak, budsjett, anskaffelse og øvelsesrapport; behold forslag og gjennomføring separat. | `åpen kilde`/`tilgang` |
| DG-P2-04 | Nordic Declaration 2027–2028: faktisk mandat, finansiering, leveranse og senere avtale. | Følg milepælene som ny dokumentversjon; ikke projiser fremtidig studie til dagens kapasitet. | `åpen kilde` |

## Håndteringsregel

Ingen gap skal fylles med 0, dagens dato, bransjefaktor eller antatt kapasitetsgrad. Når et gap lukkes, skal den nye observasjonen ha egen kilde-ID, lokator, lesestatus, påstandsvurdering og `changeFromBaseline`. «Ikke funnet» skal fortsatt angi hvilket avgrenset søk som er gjort; utilgjengelige rapporter og manglende data skal ikke omklassifiseres til fravær.
