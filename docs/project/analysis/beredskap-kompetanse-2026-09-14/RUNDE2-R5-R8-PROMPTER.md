# Runde 2 – R5–R8 klare til kjøring

15. september 2026. Oppdatert versjon av R5–R8 fra [RUNDE2-RESEARCHPROMPTER.md](RUNDE2-RESEARCHPROMPTER.md), etter kontrollen av R1–R4 i [KUNNSKAPSGRUNNLAG-RUNDE2.md](../../../../research/beredskap-kompetanse-runde2/KUNNSKAPSGRUNNLAG-RUNDE2.md). Bruk disse, ikke de gamle.

## Hva er endret

1. **Kjent fra runde 2** er lagt inn i konteksten, så svarene ikke gjentar det. Bare kontrollerte og rettede funn er brukt.
2. **Strengere kilderegler** mot feilene som gikk igjen i R1–R4: sitater som ikke var ordrette, sidetall én side feil, «sist oppdatert» lest som publiseringsdato, døde eller generelle lenker, planer og påmeldinger omtalt som gjennomført, metodebeskrivelser lest som funn, eksempellister lest som fastsatte lister, sitater fra én person tilskrevet institusjonen, opphevede lover og foreldede tall.
3. **Ny kolonne `status`** i påstandstabellen (R5, R7 og R8). R6 har allerede `niva`.
4. **Krav om full CSV:** én rad per bærende påstand og per tall, med hele URL-en. En rapport i runde 2 kom uten lenker og uten tabell, og den kunne ikke kontrolleres direkte.

## Slik kjører du dem

1. Én ny samtale per prompt, med dyp research slått på. R5–R8 er uavhengige og kan kjøres samtidig.
2. Kopier hele kodeblokken.
3. Lagre svarene som `R5-veterinar.md`, `R6-forskning-praksis.md`, `R7-taus-kunnskap.md` og `R8-husholdninger.md`.
4. Legg dem i `research/beredskap-kompetanse-runde2/rapporter/` for kontroll mot kildene, som for R1–R4.
5. R9 (sammenstilling) gjøres ikke i ChatGPT, men i repoet i en egen økt etter at R8 er kontrollert. Se nederst i denne filen.

Hvis tiden er knapp: kjør R6 og R8 først. De dekker innsikt 21 og 12 fra runde 1, som runde 2 ikke har rørt.

---

## R5 – Veterinær- og mattilsynsberedskap

```text
Du skal gjøre et grundig kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under. Skjæringsdato: 15. september 2026.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om kompetanse og beredskap i nordiske matsystemer (Norge, Sverige, Danmark, Finland, Island). Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.
Dette er allerede kjent og kontrollert, og skal ikke gjentas som hovedfunn:
- Norge: gjennomgangen av veterinærtjenester (LMD 2023) viser presset dekning i distriktene, og at veterinærer i ordinær praksis ikke uten videre kan flyttes til sykdomsutbrudd. Mattilsynet holdt felt- og bordøvelser om fugleinfluensa og svinepest i alle regioner i 2023, og øvelsene ASPekt (afrikansk svinepest) og Sarvvis (skrantesjuke på tamrein) i 2024. Øvelsene er bare rapportert i årsrapportene.
- Sverige: SOU 2022:58 konkluderer med mangel på veterinærer og dyresykepleiere. Jordbruksverket sluttet å krigsplassere veterinærpersonell etter 1995. Afrikansk svinepest ble påvist hos villsvin ved Fagersta 6.9.2023, og Sverige ble erklært fritt 25.9.2024. MSB meldte 2.9.2025 at evalueringen av krisehåndteringen var ferdig, men innholdet er ikke lest. Livsmedelsverkets øvingsserie 2021–2024 gjaldt mikrobiologiske utbrudd, og en sluttrapport er varslet.
- Danmark: Fødevarestyrelsen sender én utdannet forbindelsesoffiser til nasjonale krisemøter. En tredagers øvelse om afrikansk svinepest startet 28.1.2019 (bare bekreftet i fagpresse). Minkkommisjonens beretning (30.6.2022) fant at avlivingsbeslutningen manglet lovhjemmel.
- Finland: Ruokavirasto har rundt 80 beredskapsveterinærer, utpekt av statsveterinærene og for det meste kommunale embetsveterinærer. Øvelsen Potsi 2020 om afrikansk svinepest har fire sluttrapporter fra arrangørene.
- Island: MAST har responsplan for alvorlige dyresykdommer, men ingen beredskapsplan for matforsyning.
- EURES 2025 klassifiserer veterinær som mangelyrke i Sverige og Danmark.

Kompetansekoder: K1 praktisk i matkjeden, K2 institusjonell, K3 kunnskap i samfunnet, K4 husholdninger.

SPØRSMÅL
1. Hvordan er veterinærberedskap og vakt for produksjonsdyr organisert i Danmark, Finland og Island (offentlig ansvar, tilskudd, vaktordninger), og hva sier kildene om dekning?
2. Hvordan er kriseorganisasjonen bygget opp hos Mattilsynet, Livsmedelsverket/Jordbruksverket, Fødevarestyrelsen, Ruokavirasto og MAST: beredskapsplaner, reservepersonell, øvelser?
3. Hva sier MSBs evaluering av ASF-utbruddet 2023–2024, Potsi-sluttrapportene og Minkkommisjonen konkret om kapasitet, bemanning og kompetanse til utbruddsbekjempelse, avliving og mattrygghet? Finnes tilsvarende evalueringer av fugleinfluensautbrudd i Norden?
4. Finnes data om antall offentlig ansatte veterinærer og inspektører i mattilsynsmyndighetene over tid, og om rekrutteringsproblemer? Oppgi år, nevner og definisjon (årsverk eller personer).
5. Hvordan henger veterinærberedskap sammen med matforsyning i beredskapsdokumentene (kjøtt, melk, egg, slakteri)? Er slakterier og meierier nevnt som berørt ledd ved utbrudd?

KILDEREGLER
- Primærkilder først: myndighetsrapporter, utredninger, evalueringer av utbrudd, årsrapporter og forskning. Bransjekilder og medier er sekundære og skal merkes.
- Hver påstand: direkte URL til selve dokumentet eller saken (ikke forside, nyhetsliste eller søkeside), utgiver, publiseringsdato, sist oppdatert hvis oppgitt (skill de to), året dataene gjelder, lokator og et ordrett sitat på høyst 25 ord.
- Sitat: kopier det fra kilden. Kan du ikke åpne selve teksten, skriv «sitat ikke tilgjengelig» og sett sikkerhet til svakt. Ikke skriv egne ord i anførselstegn.
- Lokator i PDF: trykt side og PDF-side, for eksempel «s. 24 (PDF 26)».
- Status for hver påstand: lov_eller_krav | forslag_eller_høring | plan_eller_oppdrag | påmeldt_eller_pågår | gjennomført | evaluert. Et oppdrag, et utkast eller påmeldte deltakere er ikke gjennomført.
- Skill det kilden faktisk har observert fra metodebeskrivelser, forventninger, eksempellister («kan omfatte») og anbefalinger.
- Oppgi hvem som sier noe: institusjonen, en rolle i et intervju eller én høringsinstans.
- Skill arrangørens egen rapport fra uavhengig evaluering.
- Tall krever enhet, år, nevner og geografi. Oppgi utvalg og metode for undersøkelser.
- Sjekk at lover og institusjonsnavn gjelder per 15.9.2026. Finnes nyere tall enn dem du bruker, oppgi dem.
- Opplysninger om ett land skal helst ha kilde fra det landet. Merk det hvis kilden er fra et annet land.
- Ikke finn på. Finner du ikke noe: skriv «ikke funnet i avgrenset søk» og hvilke søk du gjorde.
- Ikke bruk prosjektets egne dokumenter som kilde. Ikke ranger landene.
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt, hvert med kilde-ID og sikkerhet: godt dokumentert / delvis / svakt / omstridt)
B. Organisering per land: land | veterinærvakt | mattilsynets kriseorganisasjon | øvelser | kilde-ID
C. Erfaringer fra utbrudd og øvelser: hendelse eller øvelse | land | år | type evaluering | funn om kapasitet og kompetanse | kilde-ID
D. Faktatabell over personell: indikator | land | verdi | enhet | år | nevner | kilde-ID | sammenlignbar (ja/delvis/nei)
E. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,status,tall,enhet,data_aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: R5-DK-001 osv., NORD for nordisk; type: lov_eller_krav|veileder|tall|fakta|øvelse|evaluering|case|forskningsfunn|tolkning; kildetype: primær|sekundær; sikkerhet: godt_dokumentert|delvis|svakt|omstridt)
Minst én rad per bærende påstand og per tall i del A–D. Skriv hele URL-en i CSV-en; interne sitatmarkører er ikke kilder.
F. Det vi ikke vet
G. Søkelogg (kort)
```

---

## R6 – Fra forskning til praksis i matberedskap

```text
Du skal gjøre et grundig kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under. Skjæringsdato: 15. september 2026.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om kompetanse og beredskap i nordiske matsystemer (Norge, Sverige, Danmark, Finland, Island). Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.
Dette er allerede kjent og kontrollert:
- Flere forskningsmiljøer har utført oppdrag for myndigheter: IFRO (Københavns universitet) for Fødevarestyrelsen; Oslo Economics med NIBIO og SINTEF Ocean for Nærings- og fiskeridepartementet; Landbúnaðarháskóli Íslands for det islandske departementet (matsikkerhetsrapport 2021).
- Sverige: Formas finansierte fem forskningssentre for matberedskap i 2024 (ca. 60 mill. SEK hver). Statskontoret (rapport 2023:15) fant at statens styring av kommunal og regional matberedskap var utilstrekkelig.
- Island: utredningskontraktene for matlagre 2024–2025 hadde ikke krav om oppfølging (ministersvar, delt ut 4.9.2026).
- Nordic Food Alert (TemaNord 2025:528): åtte anbefalinger ble stemt fram i en app under tidspress og er ikke en handlingsplan. Rapporten oppfordrer til systematisk stresstesting, men det er ikke vedtatt.
- Finland: Ruokavirasto skriver at anbefalingene fra øvelsen Potsi 2020 brukes i beredskapsplanleggingen. Det er myndighetens egen påstand.
- Danmark: SAMSIKs konsept for læringsopsamling har et eget vedlegg om oppfølging av implementering.
- EU: EFSCMs ekspertgruppe publiserte uforpliktende anbefalinger 23.7.2024. JRC publiserte et metoderammeverk for stresstesting i 2026, ikke en gjennomført test.
- Kunnskapsmeglere: Rådet for matvareberedskap er et rådgivende organ og kriseorganisasjon for NFD, og matprodusentene er ikke med (Bondelaget, mai 2026). Andre er NESA-pooler (FI) og SAMSIK (DK).
- Ingen kilde har vist at en mottaker faktisk brukte resultatene.

VIKTIG SKILLE
Hold disse nivåene adskilt og merk hver påstand med ett av dem: (1) oppdrag eller finansiering, (2) rapport levert, (3) rapport omtalt eller sitert av mottaker, (4) dokumentert brukt i beslutning, regelverk, plan eller praksis, (5) evaluert effekt. At en mottaker selv skriver at noe er «brukt», er nivå 3 med merknad, ikke nivå 4, med mindre beslutningen eller planen selv viser det.

SPØRSMÅL
1. Finn eksempler der forskning eller utredninger om matberedskap er sitert i offentlige beslutningsdokumenter i Norden 2018–2026 (stortingsmeldinger, proposisjoner, SOU og propositioner, danske redegørelser, finske regjeringsbeslutninger, islandske stortingsdokumenter). Hva ble brukt, og til hva?
2. Finnes evalueringer av hvordan beredskapsforskning blir tatt i bruk (for eksempel evalueringer av forskningsprogrammer, NordForsk-programmer eller Formas-sentrene)?
3. Hvordan fungerer Rådet for matvareberedskap, NESA-poolene og SAMSIK i praksis (mandat, sammensetning, møter, publikasjoner, eksempler på kunnskap som er delt)?
4. Er anbefalingene fra Nordic Food Alert, Potsi 2020, Statskontoret 2023:15 eller EFSCMs ekspertgruppe fulgt opp i et dokument fra mottakeren? Oppgi nivå.
5. Hva sier forskning om hvorfor forskning på importerstatning og matsystemomstilling ofte ikke blir tatt i bruk?
6. Hvilke nordiske eksempler finnes der forskning om matberedskap ledet til endret lagerordning, regelverk eller øvelsespraksis?

KILDEREGLER
- Primærkilder først: offentlige beslutningsdokumenter, evalueringer, programrapporter og forskning. Institusjonenes egne nyhetsartikler er sekundære for påstander om bruk og skal merkes.
- Hver påstand: direkte URL til selve dokumentet eller saken (ikke forside, nyhetsliste eller søkeside), utgiver, publiseringsdato, sist oppdatert hvis oppgitt (skill de to), lokator og et ordrett sitat på høyst 25 ord. For sitering i beslutningsdokumenter: oppgi dokumentets side og hva som står der.
- Sitat: kopier det fra kilden. Kan du ikke åpne selve teksten, skriv «sitat ikke tilgjengelig» og sett sikkerhet til svakt. Ikke skriv egne ord i anførselstegn.
- Lokator i PDF: trykt side og PDF-side, for eksempel «s. 24 (PDF 26)».
- Ikke skriv at forskning er «tatt i bruk» uten belegg på nivå 3 eller høyere.
- Skill anbefalinger og ambisjoner («bør», «should», «encouraged») fra vedtak og forpliktelser.
- Oppgi hvem som sier noe: institusjonen, en rolle i et intervju eller én høringsinstans.
- Sjekk at lover og institusjonsnavn gjelder per 15.9.2026 (eksempel: MSB heter Myndigheten för civilt försvar fra 1.1.2026; finsk lov 1390/1992 er erstattet av 107/2026).
- Ikke skriv noe om hvorvidt miljøer vil samarbeide.
- Ikke finn på. Finner du ikke noe: skriv «ikke funnet i avgrenset søk» og hvilke søk du gjorde.
- Ikke bruk prosjektets egne dokumenter som kilde. Ikke ranger land eller miljøer.
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Casetabell: case | land | forskningsmiljø | mottaker | høyeste dokumenterte nivå (1–5) | belegg | kilde-ID
C. Kunnskapsmeglere – hvordan de fungerer
D. Oppfølging av anbefalinger (spørsmål 4)
E. Hva forskningen sier om barrierer for bruk
F. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,niva,tall,enhet,data_aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: R6-NO-001 osv., NORD for nordisk og EU for EU; niva: 1–5 etter skillet over)
Minst én rad per bærende påstand og per case i del A–E. Skriv hele URL-en i CSV-en; interne sitatmarkører er ikke kilder.
G. Det vi ikke vet
H. Søkelogg (kort)
```

---

## R7 – Taus kunnskap og generasjonsskifte i matproduksjonen

```text
Du skal gjøre et grundig litteratur- og kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under. Skjæringsdato: 15. september 2026.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om kompetanse og beredskap i nordiske matsystemer (Norge, Sverige, Danmark, Finland, Island). Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.
Dette er allerede kjent og kontrollert:
- Sverige: brukeren er over 60 år på 48 % av jordbruksforetakene (2025); knapt en fjerdedel av brukerne 60–80 år har etterfølger klar (Jordbruksverket 2026).
- Norge: 36 627 jordbruksbedrifter (2025); arbeidsinnsatsen falt fra 120 til 75 mill. timeverk (2004/05–2023). Finland: gjennomsnittsalder 55 år (2024).
- Bornholm: aktører knyttet tap av kompetanse på frukt og grønt til spesialisering i animalsk produksjon (TemaNord 2022:528). En finsk ekspertmodell (Rikkonen mfl. 2026) beskriver spesialisering som kilde til både oppdatert fagkompetanse og mindre mangfold; den bygger på samme ni ekspertintervjuer som Rimhanen 2023.
- Svensk restaurantstudie (Sundqvist og Marshall 2025): konserveringskunnskap forsvant når nøkkelpersoner sluttet.
- Svenske historikere (Eriksson og Bertilsson): kunnskap og ekspertise i matberedskapen «delvis gått förlorad» etter den kalde krigen.
- Runde 2 fant ingen kilde som sier hvor mange nøkkelpersoner, automatikere eller innleide teknikere et automatisert matanlegg er avhengig av. En finsk studie (Luke 2017, data 2016–2017, tre slakterier og tre logistikkaktører) beskriver strømavhengige funksjoner, men ikke personer.

SPØRSMÅL
1. Hva sier nordisk forskning om hvordan praktisk kunnskap overføres ved generasjonsskifte i jordbruk, fiske og matforedling (familieoverdragelse, læretid, rådgivning, fagskoler)? Hva går tapt og hva bevares?
2. Finnes studier av kunnskap som har forsvunnet eller er i ferd med å forsvinne i nordisk matproduksjon (for eksempel lokale kornsorter og dyrking, konservering, slakting på gård, småskala foredling, beredskapslagring)?
3. Hvordan påvirker rådgivningstjenester (Norsk Landbruksrådgiving, Hushållningssällskapen, SEGES, ProAgria, RML) kompetansen i primærproduksjonen, og finnes evalueringer?
4. Hva sier forskning om nyetablerte bønder og bønder uten landbruksbakgrunn: hvor lærer de, og hva mangler?
5. Finnes nordiske eller europeiske studier som kobler kunnskapsbredde eller -tap i jordbruket til evne til å tilpasse seg sjokk (tørke, fôrmangel, prissjokk)?
6. Finnes studier av erfaringskunnskap som er bundet til få personer i nordisk matforedling (prosessdrift, vedlikehold, automasjon), og hva skjer når de slutter?

KILDEREGLER
- Primærkilder først: fagfellevurdert forskning, offisiell statistikk, evalueringer og offentlige utredninger. Bransjekilder og medier er sekundære og skal merkes.
- Hver påstand: direkte URL (helst DOI), forfattere, år, lokator og et ordrett sitat på høyst 25 ord. Kontroller at forfatter og artikkel faktisk hører sammen.
- Sitat: kopier det fra kilden. Kan du ikke åpne selve teksten, skriv «sitat ikke tilgjengelig» og sett sikkerhet til svakt. Ikke skriv egne ord i anførselstegn, og ikke bruk abstraktet som om det var funn fra hele artikkelen.
- Lokator i PDF: trykt side og PDF-side, for eksempel «s. 24 (PDF 26)».
- Status for hver påstand: lov_eller_krav | forslag_eller_høring | plan_eller_oppdrag | påmeldt_eller_pågår | gjennomført | evaluert.
- Oppgi utvalg og metode (antall informanter eller gårder, land, år for datainnsamling). Skill publiseringsår fra dataår.
- Merk om flere publikasjoner bygger på samme datamateriale; de er da ikke uavhengige.
- Skill det studien har observert fra informantenes utsagn og forfatternes tolkning.
- Tall krever enhet, år, nevner og geografi. Finnes nyere tall enn dem du bruker, oppgi dem.
- Ikke finn på. Finner du ikke noe: skriv «ikke funnet i avgrenset søk» og hvilke søk du gjorde.
- Ikke bruk prosjektets egne dokumenter som kilde.
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Hvordan praktisk kunnskap overføres – mekanismer og funn
C. Kunnskap som er dokumentert tapt eller truet
D. Rådgivning, nyetablerte og nøkkelpersoner i foredling – det kildene sier
E. Kobling til tilpasningsevne ved sjokk
F. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,status,tall,enhet,data_aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: R7-SE-001 osv., NORD for nordisk og EU for europeisk; type: tall|fakta|forskningsfunn|evaluering|case|tolkning; kildetype: primær|sekundær; sikkerhet: godt_dokumentert|delvis|svakt|omstridt; utgiver: forfattere og tidsskrift for forskning)
Minst én rad per bærende påstand og per tall i del A–E. Skriv hele URL-en i CSV-en; interne sitatmarkører er ikke kilder.
G. Det vi ikke vet
H. Søkelogg (kort)
```

---

## R8 – Sårbare husholdninger og kommunenes ansvar for mat i krise

```text
Du skal gjøre et grundig kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under. Skjæringsdato: 15. september 2026.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om kompetanse og beredskap i nordiske matsystemer (Norge, Sverige, Danmark, Finland, Island). Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.
Dette er allerede kjent og kontrollert:
- Råd om egenberedskap: Norge og Sverige én uke, Danmark tre døgn, Finland 72 timer; Island (Røde Kors) tre dager.
- Selvrapportert beredskap: NO 74 % tørrmat «noen dager» (2025); SE 73 % mat for en uke (2023); FI 85 % mat for tre dager og 59 % erfaring med matlaging uten strøm (2025).
- Eldre oppgir bedre lager enn unge, men undersøkelsene sier lite om de eldste og hjelpetrengende. I Finland er unge, lavinntekt og byboere dårligere forberedt.
- DSB: mottakere av helsetjenester hjemme skal få hjelp i krise, men det kan ta lengre tid.
- Norge: helseberedskapsloven § 2-1 og § 2-2 gir kommunene planplikt for helse- og omsorgstjenester, også private tjenester etter lov eller avtale. Helsedirektoratets høringsutkast til retningslinje for mat og måltider i helse- og omsorgstjenesten foreslår minst sju dagers matberedskapslager (høringsfrist 3.12.2026; ikke vedtatt). Regjeringen etablerte 2.6.2026 en tilskuddsordning på 4 mill. kr for frivillig mat- og måltidsberedskap, omsorgsberedskap og psykososial støtte, forvaltet av Hovedredningssentralen.
- Danmark: KL ber kommunene avklare hvilket servicenivå de kan holde for madservice ved langvarig strømbrudd (veiledning, ikke lovkrav). SAMSIK har en pulje på 2 mill. kr i 2026 til kurs for innbyggere om kriser.
- Finland: forskrift 308/2023 krever beredskaps- og kontinuitetsplaner i velferdsområdene, også hos private leverandører.
- Betaling: Sverige har utvidet offline-kortbetaling for nødvendige varer fra 1.7.2026. Norge har en reserveløsning med inntil sju døgns offlinekjøp, men ved en hendelse 16.5.2022 hadde mange utsalgssteder ikke tatt den i bruk. I Danmark har de fleste landsdekkende dagligvarekjedene sju dagers offline-beredskap (april 2026).
- Ingen representative målinger for personer med særlige kostbehov er funnet.

SPØRSMÅL
1. Hvilket ansvar har kommunene i hvert land for matforsyning til hjemmeboende som får hjemmetjenester, matombringing eller omsorg, når vanlige leveranser svikter? Finn lover, veiledere og beredskapsplaner, og skill krav fra råd.
2. Finnes kartlegginger av hvor mange som er avhengige av matombringing eller hjelp til mat, og hva vet vi om beredskapen for dem?
3. Hva sier kilder om matforsyning til personer med særlige kostbehov i krise (sondemat, konsistenstilpasset kost, allergier, diabetes)?
4. Hvilken rolle har frivillige organisasjoner (Røde Kors, Sanitetskvinner, Matsentralen, matbanker) i matforsyning i krise i hvert land, og hva sier evalueringer av deres innsats (for eksempel under covid eller naturhendelser)? Hvem har fått midler fra den norske tilskuddsordningen fra 2026, og til hva?
5. Hva viser erfaringer fra langvarige strømbrudd eller naturhendelser i Norden om matsituasjonen for sårbare husholdninger, inkludert om de fikk kjøpt og betalt for mat?

KILDEREGLER
- Primærkilder først: lover, veiledere, offentlige undersøkelser, evalueringer og forskning. Organisasjonenes egne sider er primære for egen virksomhet, men sekundære for effekt, og skal merkes.
- Hver påstand: direkte URL til selve dokumentet eller saken (ikke forside, nyhetsliste eller søkeside), utgiver, publiseringsdato, sist oppdatert hvis oppgitt (skill de to), året dataene gjelder, lokator og et ordrett sitat på høyst 25 ord.
- Sitat: kopier det fra kilden. Kan du ikke åpne selve teksten, skriv «sitat ikke tilgjengelig» og sett sikkerhet til svakt. Ikke skriv egne ord i anførselstegn.
- Lokator i PDF: trykt side og PDF-side, for eksempel «s. 24 (PDF 26)».
- Status for hver påstand: lov_eller_krav | forslag_eller_høring | plan_eller_oppdrag | påmeldt_eller_pågår | gjennomført | evaluert. Et høringsutkast eller en utlyst tilskuddsordning er ikke gjennomført aktivitet.
- Skill råd, ansvar på papiret, målt beredskap og erfaring fra faktiske hendelser. Skill «skal» fra «bør».
- Oppgi utvalg og metode for undersøkelser (antall, år, hvem som ble spurt). Finnes nyere tall enn dem du bruker, oppgi dem.
- Opplysninger om ett land skal helst ha kilde fra det landet. Merk det hvis kilden er fra et annet land.
- Sjekk at lover og institusjonsnavn gjelder per 15.9.2026.
- Ikke samle opplysninger om enkeltpersoner.
- Ikke finn på. Finner du ikke noe: skriv «ikke funnet i avgrenset søk» og hvilke søk du gjorde.
- Ikke bruk prosjektets egne dokumenter som kilde. Ikke ranger landene.
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
Del F (påstandstabellen) er obligatorisk. Et svar uten CSV-blokk med hele URL-er kan ikke kontrolleres og blir ikke brukt.
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Kommunenes ansvar per land: land | hjemmel/veileder | krav eller råd | hva ansvaret omfatter | kilde-ID
C. Særlige kostbehov – det kildene sier
D. Frivillige organisasjoners rolle og evalueringer
E. Erfaringer fra hendelser
F. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,status,tall,enhet,data_aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: R8-NO-001 osv., NORD for nordisk; type: lov_eller_krav|veileder|tall|fakta|evaluering|case|forskningsfunn|tolkning; kildetype: primær|sekundær; sikkerhet: godt_dokumentert|delvis|svakt|omstridt)
Minst én rad per bærende påstand og per tall i del A–E. Skriv hele URL-en i CSV-en; interne sitatmarkører er ikke kilder.
G. Det vi ikke vet
H. Søkelogg (kort)
```

---

## R9 – Sammenstilling (gjøres i repoet, ikke i ChatGPT)

Sammenstillingen trenger ikke ny nettresearch. Den bygger på `research/beredskap-kompetanse-2026-09-15/KUNNSKAPSGRUNNLAG.md` og `research/beredskap-kompetanse-runde2/KUNNSKAPSGRUNNLAG-RUNDE2.md` (med R8 lagt inn), og gjøres derfor i repoet i en egen økt, der påstands-ID-er, kontrollfiler og rettelser er tilgjengelige. Kodeblokken under er oppgavebeskrivelsen. Den erstatter R9 i [RUNDE2-RESEARCHPROMPTER.md](RUNDE2-RESEARCHPROMPTER.md), fordi rapportene fra runde 2 hadde mange feil som bare er rettet i de kontrollerte filene.

```text
Les to kontrollerte kunnskapsgrunnlag i repoet om kompetanse og beredskap i nordiske matsystemer (Norge, Sverige, Danmark, Finland, Island):
(1) KUNNSKAPSGRUNNLAG.md – runde 1, kontrollert mot kildene.
(2) KUNNSKAPSGRUNNLAG-RUNDE2.md – runde 2 (offentlige måltider, øvelser, kritiske roller, transport, veterinærberedskap, forskning til praksis, taus kunnskap og sårbare husholdninger), kontrollert mot kildene.
Ikke still oppklarende spørsmål. Ikke gjør ny research på nettet, med ett unntak: du kan åpne en kilde for å kontrollere en påstand der de to filene er i motstrid.

OPPGAVE
Lag ett samlet kunnskapsgrunnlag som forklarer hele materialet. Målet er forståelse. Ikke skriv anbefalinger, tiltak eller forslag til prosjekter.

REGLER
- Bruk bare funn som står i filene. Ikke legg til nye fakta.
- Bruk rettelsene (del 5 i begge filene). Ikke gjeninnfør feil som er rettet.
- Behold de opprinnelige påstands-ID-ene (for eksempel A:P2-NO-010, G3-SE-003, R5-IS-003, X-024) ved hvert funn.
- Behold sikkerhetsnivået fra filene, eller senk det. Ikke hev det.
- Skill tydelig mellom det kildene sier og din sammenstilling. Merk sammenstillingen med «Sammenstilling:».
- Skill krav, plan, gjennomført aktivitet og evaluert effekt.
- Skriv på norsk bokmål, kort og i enkelt språk.

LEVERANSE (markdown)
1. Hovedinnsikter på tvers (12–15 avsnitt). Hver med påstands-ID-er og sikkerhet (godt dokumentert / delvis / svakt / omstridt).
2. Forklaringsmodell: oppdater tabellen K1–K4 (praktisk, institusjonell, kunnskap i samfunnet, husholdninger) mot tidshorisont (akutt, kontinuitet, strukturell) fra runde 1 med det runde 2 viser.
3. Hva som har endret seg fra runde 1 til runde 2: hvilke innsikter som er styrket, svekket eller nyansert, med nummer fra begge filene.
4. Motstrid mellom filene, med forklaring (definisjon, år, kilde).
5. Svake punkter: funn som bare har sekundærkilde, er selvrapportert, bygger på et lite utvalg eller er arrangørens egen vurdering.
6. Landbilder: tabell land | hva som er best dokumentert | hva som mangler.
7. De viktigste kunnskapshullene, gruppert etter K1–K4 og land.
8. Ordliste over begreper som brukes (kort).
```
