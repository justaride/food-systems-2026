# Kontroll av A1–A6 – 08.09.2026

**Vurdering: nyttig internt kunnskapsgrunnlag, men A6 trenger rettelser før det brukes som samlet fasit.** De oppgitte antallene og spørsmålsdekningen stemmer. Kontrollerte hovedpåstander om lager, Aass og Island holder innenfor sine avgrensninger. Vi fant samtidig konkrete kilde-, metadata- og samordningsfeil. Den viktigste positive korreksjonen er at en nordisk FAO-serie allerede finnes i leveransen og nå er etterprøvd.

Originalleveransene A1–A6 er bevart. [Rettelsesregisteret](corrections.json) er et separat tillegg, ikke en endring av kanoniske plattformdata. «Kontrollert» nedenfor betyr den angitte kontrollen; ingen menneskeverifisering eller white paper-godkjenning er utført.

## Hva som er bekreftet

| Kontroll | Resultat | Hva resultatet betyr |
|---|---|---|
| Antall i A1–A5 | 86 kilderegistreringer, 127 observasjonsrader, 41 gap | Stemmer med filene. Dette er ikke 86 uavhengige primærkilder eller 127 enkeltmålinger; enkelte rader inneholder flere verdier. |
| Spørsmålsdekning | 25 av 25 etter dokumentert ID-normalisering | Alle spørsmål har funn eller gap. Det betyr ikke at alle databehov er løst. |
| Referanser | Ingen foreldreløse kildepekere, underlagskildepekere, søkeloggpekere eller eksplisitte A6-ID-er i den strukturelle kontrollen | ID-eksistens er kontrollert. Betydningen bak enkelte gap-ID-er er likevel inkonsistent. |
| JSON og status | Alle resultat-JSON leses; A1–A5 har `templateOnly=false`; ingen godkjenningsflagg for `human_verified` funnet | Teknisk format og flagg er i orden. |
| Registrerte arkivfiler | 9 finnes; 7 registrerte hasher stemmer, 2 avviker | To metadatarettelser er nødvendige. 77 kilderegistreringer har ingen lokal arkivsti. |
| Beregninger | Ingen oppføringer i `calculations` | A6 har ikke videreført egne beregninger. Kildetranskripsjoner kan likevel etterprøves; det er gjort for FAO-serien. |

Strukturkontrollen kan kjøres på nytt med [audit.py](audit.py) eller via [notebooken](audit.ipynb). Detaljer finnes i [structural-audit.json](structural-audit.json). Kontrollen av ID-er omfatter eksplisitte ID-er i A6-tekst; den beviser ikke at alle komprimerte intervaller eller formuleringer er semantisk riktige.

## Funn som må rettes

### QA-01 – Middels: måleenhet for kornlager er tolket som varefordeling

A1-O014 og A1s funn omtaler kapasitetskartleggingen som et primært byggsystem/byggbasert infrastrukturnivå. Kilden beskriver samlet kapasitet ved kornmottak, **målt som bygg**. Dette er et målegrunnlag; det dokumenterer ikke at lagerbruken er dominert av bygg. Behold tallene som kornlagerkapasitet med denne måleenheten og rapportens avgrensninger. [Arbeidsgrupperapport 2025](https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Arbeidsgrupperapport%20Korn%20og%20kraftfor%20PUBLISERT.pdf), PDF-side 20–21 / trykt side 18–19, §2.5.2.

### QA-02 – Middels: forskjellig nevner er påstått uten å være etablert

A1-O035 og A6 omtaler 53 prosent som en annen råvare-/nevnerdefinisjon enn 34 prosent. Arbeidsgrupperapporten bruker norskandel i matmelet; årsrapporten omtaler matkorn i norsk mel. **Forskjellig periode er dokumentert, forskjellig nevner er ikke demonstrert.** Skriv «ulike perioder; detaljert sammenlignbarhet må avklares». Korriger også A1-O035s lokator fra trykt side 95 til trykt side 94 / PDF-side 96. [Arbeidsgrupperapport, oppsummering](https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Arbeidsgrupperapport%20Korn%20og%20kraftfor%20PUBLISERT.pdf), [årsrapport 2025, side 66](https://www.regjeringen.no/contentassets/a34b107c580e48288f48c53b5f2b7dbf/landbruksdirektoratets-arsrapport.pdf).

Dette gir ikke automatisk grunnlag for en harmonisert tidsserie, men begrunnelsen for å holde tallene atskilt må være presis.

### QA-03 – Middels, stor praktisk betydning: A6 tar ikke videre tilgjengelige FAO-data

**A3-O020 inneholder allerede en matrise for fem land og fem treårsperioder: 25 punktestimater og 50 intervallgrenser.** Original ZIP ble hentet på nytt fra FAO; filhashen er identisk med A3-S009. Alle 75 verdier stemmer med CSV-en, indikator 210091. [FAOSTAT bulkdata](https://bulks-faostat.fao.org/production/Food_Security_Data_E_All_Data_(Normalized).zip), [reproduksjonskvittering](fao-reproduction.json).

A6 er åpen om at denne delen bare er agentrapportert i egen kontroll. Problemet er at konsekvens-/gapteksten ikke tar hensyn til matrisen som faktisk er levert. DG-P0-04 grupperer dessuten katalogenes manglende enkeltårsdata sammen med den åpne bulkserien. Skillet må være:

- **Tilgjengelig og nå kontrollert:** separat beskrivende FAO-serie med samme indikator og treårsperioder, med usikkerhetsintervaller.
- **Fortsatt uavklart:** faktiske utvalgsstørrelser for relevante bølger, eventuelle enkeltårsestimater og sammenstilling med andre instrumenter.

SIFO skal fortsatt ikke blandes direkte med FIES. Treårsperiodene overlapper, og intervallene må følge tallene. Serien gir ikke i seg selv grunnlag for sikre rangeringer, kausale forklaringer eller en trendtest som antar uavhengige perioder.

### QA-04 – Middels: to hasher er feil i kilderegisteret

A3-S001 og A4-S001 har registrerte SHA-256-strenger som ikke matcher filene. Resultatet er bekreftet med Python `hashlib`, `shasum` og OpenSSL. Avvikene er forenlige med transkripsjonsfeil; dokumentidentitet er kontrollert separat. Det er ikke funnet bevis for at feil rapport er brukt.

[Arkivkvitteringen](archive-receipt.json) inneholder full registrert og faktisk hash, opprinnelig manifesthash og ny privat arkivsti. De ni tilgjengelige arkivfilene er kopiert til varig, innholdsadressert lagring utenfor Git. Dermed er også A4s tre `/tmp`-filer sikret. Originalmanifestene er ikke overskrevet.

Manglende arkivsti for de øvrige 77 registreringene er en begrensning i etterprøvbarhet, ikke bevis på at kildene ikke ble lest. Før hovedpåstander tas videre bør relevante fulltekster sikres der tilgang og rettigheter tillater det, eller kobles til eksisterende prosjektarkiv.

### QA-05 – Middels: A1s gap-ID-er betyr forskjellig i tekst og JSON

| I A1/funn.md | Tilsvarende innhold i A1/data.json |
|---|---|
| Avsnitt merket A1-G003: ledetid og avbruddsberedskap | A1-G004 og A1-G005 |
| Avsnitt merket A1-G004: bakeri/distribusjon og operativ kobling | A1-G006 og A1-G007 |
| Avsnitt merket A1-G005: råvareandeler | A1-G008 |

Dette kan sende oppfølgingsarbeid til feil databehov, selv om alle ID-ene finnes. Bruk `data.json` som arbeidsnøkkel og denne koblingstabellen ved revisjon av teksten. A2s spørsmåls-ID-er og A5s kilde-ID-er har derimot eksplisitte normaliseringer i A6 som kan følges.

### QA-06 – Middels: rettelsesloggen overdriver hvor mye som er avkreftet

R002, R004, R012, R021 og R022 gjelder i vesentlig grad avgrensninger som allerede står i originaldataene. A1-O002 er for eksempel allerede `kind=mal` og sier at målet ikke må leses som faktisk beholdning. A4s scenario- og nevnerforbehold er også eksplisitte. A6s faglige forbehold er nyttige, men etiketten «avkreftet/omklassifisert» dokumenterer ikke en faktisk feilretting i disse radene.

Bytt til «bekreftet opprinnelig avgrensning» eller «redaksjonell presisering» der dette er riktig. Behold «avkreftet» for en konkret, kildeavkreftet originalpåstand. De sju grupperte radene skal ikke presenteres som sju faktiske feil. Kontroller også konsekvent bruk av A6s lesestatus: eksempelvis omtales Aass-prosessflyt som både selvstendig kontrollert og bare agentrapportert ulike steder.

### QA-07 – Lav: avklarte tilgangsgap bør ikke bestilles på nytt

De to nyere islandske rapportene er nå tilgjengelige og kontrollert. Videre spørsmål gjelder gjennomføring og faktiske lagre, ikke bare tilgang til disse rapportene. A5-G007s Åland-tekst finnes allerede i prosjektets private arkiv fra 07.09; det bør undersøkes før en ny innhentingsrunde. Eventuelle nye vedlegg og endelig gjennomføringsdokumentasjon er separate behov.

## Hva kontrollen styrker

To Luna-agenter gjorde avgrensede kildekontroller, og hovedagenten kontrollerte struktur, arkivintegritet, kornformuleringene og alle FAO-cellene. Aass' 2025-rapport støtter den årfestede literopplysningen; fôrstudiene gir metodekunnskap, ikke en Aass-spesifikk effekt. De nyere islandske rapportenes dokumentidentitet og utvalgte sentrale dimensjoneringstall er bekreftet. Det tidligere tilgangsgapet er dermed reelt redusert. Se [Aass/mattilgang](aass-mattilgang-check.md) og [Island](island-check.md).

Det er fortsatt riktig å skille rapportert beholdning fra disponibel reserve og dokumentert samarbeid fra en matleveranse. Gjennomgangen gir samtidig mer enn bare nye gap: den gir en kontrollerbar nordisk indikatorserie og lesbare islandske originalrapporter som kan brukes til avgrenset analyse.

## Arbeidsstatus og kontrollgrenser

Ferdig: strukturaudit, selektiv primærkildekontroll, full transkripsjonskontroll av A3-O020, private arkivkopier og separat rettelsesregister. Ikke utført: full kilde-for-kilde-kontroll av alle 86 registreringer, ny implementering av A6, import eller publisering. Påstander om at den tidligere kjøringen ikke kontaktet noen eller endret hovedcheckouten er ikke uavhengig revidert gjennom aktivitetslogger; denne kontrollen har ikke utført slike handlinger.

Bruk leveransen internt sammen med dette kontrollnotatet. Før A6 brukes som samlet videreføringsdokument, bør QA-01–06 innarbeides i en ny, sporbar revisjon. Den opprinnelige researchrunden er dekket etter oppdragets regel om «funn eller gap»; den samlede faglige kvalitetssikringen er ikke feilfri eller uttømmende.
