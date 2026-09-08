# Arbeidsgrunnlag for kilde- og driftsrestanser

Kontrolltid for produksjonsuttrekket: 2026-09-08T18:38:51.446Z. Dette er forberedelse og negative avviksvurderinger, ikke kanonisk kildepromotering eller menneskelig review. Ingen henvendelser er sendt.

## Regnskap: konkrete kandidater for neste kildeavstemming

1. **Axfood 2025:** [offisiell årsrapportside](https://www.axfood.se/investerare/rapporter-och-presentationer/ars--och-hallbarhetsredovisning-2025/) oppgir 89 152 MSEK omsetning og 3572 MSEK driftsresultat. NOK-lagringen følger 2025-gjennomsnitt i `research/data/nordic/fx/norges-bank-2025-average-rates-2026-07-02.json`. Lagret kildebeskrivelse omtaler resultatet som justert; originalsidens nøkkeltall er ikke merket slik. Denne kvalifikatoren må avstemmes mot rapporttabellen før beskrivelsen brukes som presis kildehenvisning.
2. **Nofima:** [årsregnskap 2024](https://nofima.no/wp-content/uploads/2025/06/Arsmelding-Nofima-2024.pdf), fysisk PDF-side 11 / resultatregnskap trykt SIDE 2, enhet hele tusen NOK. 2024: driftsinntekter 735 592 og driftsresultat -23 897. Sammenligningsåret 2023: 721 311 og -5928. «1» foran driftsinntektene er notehenvisning, ikke del av beløpet. Gjeldende gamle 2023-rad 725/-18 MNOK holdes tilbake i økonomi og selskap. Kildebeløp er ikke overskrevet. PDF-innholdet var tilgjengelig via nettleserens kildeleser; direkte arkivnedlasting returnerte HTTP 403, så ingen lokal PDF-hash påstås.
3. **Holdbart:** [Regnskapsregisterets åpne API](https://data.brreg.no/regnskapsregisteret/regnskap/815664582) ble hentet. Responsen gjelder selskapsregnskap 2025, NOK: driftsinntekter 739 469 390, driftsresultat 30 581 664, årsresultat 24 738 351. Kandidatgrunnlag: `holdbart-brreg.json`, SHA256 `48c30a02f636d7c21cde1a87442bc849f5b38df4f8ae0f59215df771f879db81`. Dette gir ingen primærverifisering av 2024 eller eldre år. Skaff historiske årsregnskap før de gamle verdiene endres.
4. **Austevoll 2024:** produksjonsraden har 30 600 lagret omsetning og 4 200 000 000 driftsresultat med samme skala. En radskala kan ikke normalisere begge. Originalrapport og konsolideringsomfang må avstemmes før ny kandidat for komplett monetær rad.

## KI: fersk populasjon og bevart pilot

Ny populasjonshash: `61ca76cecd0cf25ba8e6c0d397258bdfa3e7974ffcea52fd63d2a4dab21d058e`. 1770 registreringer: 1610 input-egnede og 160 med manglende lesbart, hashbundet dokumentinput. Alle 399 reviewoppføringer er fortsatt kølagt. Ingen av disse tallene betyr at kildeinnhold eller claims er validert.

Det eldre private løpet `codex-native-pilot-27` har 10 kilder, 53 enheter, 18 analysejobber og 74 claims. Ti originale valideringssvar ble funnet i de separate `codex-native-validation-responses-27-a/b/c`-mappene. Alle ti besto kontroll mot eksakt forespørsel, kilde, resultat, påstand og enhet før de ble innlest gjennom eksisterende køverktøy. Modellnavn og originale svar er bevart. Dette er et separat validatorpass med **samme modell**, ikke dokumentasjon på uavhengighet mellom modellfamilier.

Piloten er nå **queue_terminal** med etterfølgende bestått privat filaudit. Resultat: **7 quarantined, 3 partial, 0 ferdig validerte kilder**. Til sammen 30 funn: F2=2, F3=8, F4=5, F5=15; ett F2-funn er kritisk. `source-workpack/pilot-repair-findings.csv` har påstands-ID, enheter, feilforklaring og neste tiltak for hvert funn.

Sluttmanifestets SHA256: `8a74ad439c5f78309f196db79dea8c5303be6f770e2edc44bcffcbcce5191153`. Post-audit: `0f061438f9bcd5162730fd54ce5b3e555f879ef2e0b2ca6d532794251b1e2413`. Terminalkvittering og sammenligning mot dagens populasjon ligger i bevismappen. Ingen av pilotens ti gamle identiteter har eksakt ID+versjonsbinding i dagens produksjonsuttrekk; fem har identisk innholdshash på en nåværende registrering. Dette gir koblingskandidater, ikke automatisk juridisk eller kanonisk identitet.

Neste tekniske trinn er å reparere kildeutdrag/claim-dekning i en ny avgrenset kandidatkjøring og kontrollere binding til dagens kilder før ny validering. Bevar de avviste historiske kandidatene. **Fullkøen er fortsatt urørt**, siden pilotens kvalitetsresultat ikke gir grunnlag for skalering. I produksjon er både kandidatinnhold, kandidatkjøringer, artefakter, assertions, menneskelige reviewvedtak og promoteringer fortsatt **0**. Kandidatskriving skal gå gjennom den eksisterende avgrensede writeren og riktig kandidatarbeiderrolle. Ingen menneskelig gjennomgang av hundrevis av poster erstatter det gjenstående KI-arbeidet.

## Kjøperunderlag

60 310 rader har registrert produsentmengde uten dokumentert kjøper. Nødvendig underlag for hver kobling: produsentens organisasjonsnummer, juridisk kjøper, vare, år/periode, faktisk levert mengde og enhet dersom dette hevdes, originalkilde med side/rad og innhentingsdato. Medlemskap, generell leverandørstatus og dominerende mottaker beviser ikke hvem som mottok et bestemt årsvolum.

`DeliveryVolume` har unik nøkkel `(supplierOrgNr, commodity, year)`. Et totalvolum kan derfor ikke uten videre splittes på flere kjøpere i denne modellen. Før slike data importeres må man velge mellom separat dokumentert relasjonsbevis uten volumfordeling eller en egen modell for kildebelagte leveranseallokeringer. Summen av allokeringer skal ikke overstige dokumentert total; ukjent rest skal bevares.

## C2/C3: 40 konkrete dataforespørsler

`source-workpack/flow-data-requests.csv` inneholder alle faktiske produksjonshull, med samme land, kalenderår 2024 og systemgrense som i databasen. C2 gjelder fire ledd fra oppdrett til slambehandling/sluttpunkt i fem land. C3 gjelder innsamling, biogass, biorest og landbruk i fem land.

Eksisterende underlag er gjennomgått før nye tall foreslås:

- `research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md` dokumenterer at de kjente FHF/SINTEF-tallene gjelder modellert utslipp og eldre perioder, med manglende sammenhengende måling av innsamlet/behandlet. Notatets kildelenker er videre spor, ikke ny primærverifisering i denne pakken.
- NORSUS OR 48.23, lest i `research/innhenting-2026-08-05/staging/norsus-biorest-2023.txt`, omfatter marine råstoffer og husdyrgjødsel, med modellert gjødselpotensial og eldre biorestgrunnlag. Det fyller ikke nasjonal kommunal matavfallskjede for 2024. Bevar skillet mellom tørrstoff, våtvekt, produsert biorest, faktisk brukt biogjødsel og N/P/K.
- Den historiske rapporten `nordic-c2-c3-flow-skeleton-readback-2026-09-04.md` viser to tidligere fyllinger. Disse ble avvist i PR #397/#398. Rapporten er et historisk readback og må ikke brukes som gjeldende status.

For hver rad må dataeier levere originaltabell, metode, land/anlegg, periode, oppnådd mengde, våt-/tørrvekt/TS og dokumentert sluttbruk. Separate N/P/K-mengder krever konsentrasjons- og mengdegrunnlag; kapasitet eller gjødselpotensial alene er utilstrekkelig. Ingen hull er automatisk lukket.

## Ansvar og neste handling

`source-workpack/actor-followups.csv` har 68 oppføringer med eksisterende forespørsel og handling, pluss tre eksplisitte mangelkolonner. 23 mangler ansvarlig, 28 neste handling og 68 dokumentert kontrolldato. Dette er klare oppgaver for prosjektets rollefordeling og kildekontroll, ikke grunnlag for å sette dagens dato som om kontroll hadde skjedd.

Arbeidskøens samlede 94 oppføringer bevares. Selskapsavstemmingens utvidede detaljer gjør det mulig å vurdere unikt innhold før eventuell migrering av gamle identiteter; likt navn er fortsatt ikke nok.

## Semantisk søk og Mac-runtime

Produksjon mangler OPENAI_API_KEY og har 0/1615 dokumenter med embeddings. `scripts/generate-embeddings.ts` finnes, men sender dokumenttekst til embeddingstjenesten og begrenser input til 8000 tegn. Før kjøring må prosjektets nøkkel konfigureres, dokumentutvalget vurderes og en avgrenset pilot kontrolleres for treffkvalitet og videre indekseringsomfang. Ingen API-nøkler er funnet, skrevet ut eller lånt fra andre prosjekter. Søk fungerer med nøkkelord mens semantisk modus er deaktivert.

Mac-feilen er presis: manifestets loader-alias 20 peker forventet til `/opt/homebrew/Cellar/llhttp/9.4.2/lib/libllhttp.9.4.2.dylib`; maskinens aktuelle alias peker til 9.4.3. Dette krever en kontrollert runtime-/forseglingsoppdatering, inkludert de bundne manifest- og entrypoint-hashene. En løsere tillatelsesliste eller håndredigert pin er ikke en retting. Linux-CI må vurderes separat.
