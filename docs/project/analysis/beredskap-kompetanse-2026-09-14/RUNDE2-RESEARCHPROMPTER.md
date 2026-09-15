# Runde 2 – researchprompter for videre innsikt om beredskap og kompetanse

15. september 2026. Oppfølging av [kunnskapsgrunnlaget](../../../../research/beredskap-kompetanse-2026-09-15/KUNNSKAPSGRUNNLAG.md) og [vurderingen av Grok](../../../../research/beredskap-kompetanse-2026-09-15/GROK-VURDERING.md).

> **R5–R8 er oppdatert** etter kontrollen av R1–R4. Bruk [RUNDE2-R5-R8-PROMPTER.md](RUNDE2-R5-R8-PROMPTER.md) når de skal kjøres.

Runde 1 ga en bred forståelse, men også tydelige hull. Runde 2 går dypere på de hullene som betyr mest for forståelsen. Promptene handler om kunnskap og fakta, ikke om søknad, partnere eller tiltak.

## Slik kjører du dem

1. Én ny samtale per prompt, med dyp research slått på (ChatGPT Pro eller tilsvarende). R1–R8 er uavhengige og kan kjøres samtidig.
2. Kopier hele kodeblokken. Hver prompt har egen kontekst, kilderegler og leveranseformat.
3. Lagre svarene som `R1-maltider.md`, `R2-ovelser.md` osv.
4. Når R1–R8 er ferdige: kjør R9 i en ny samtale med de åtte svarene lastet opp.
5. Legg filene i `research/beredskap-kompetanse-runde2/` for kontroll mot kildene, slik som i runde 1.

## Prioritering

| Prompt | Tema | Hull i kunnskapsgrunnlaget |
|---|---|---|
| **R1** | Offentlige måltider som beredskapsfunksjon | Innsikt 19: bare Sverige har målt kommunale beredskapsplaner for måltider |
| **R2** | Øvelser og læring etter hendelser | Innsikt 17: ingen evalueringer av matøvelser funnet; Nordic Food Alert ikke lest |
| **R3** | Kritiske roller og personell i matkjeden | Innsikt 2 og 11: ingen terskler for hvor mange fagfolk kjeden tåler å miste |
| **R4** | Transport, grossistledd og kjølekjede | Hull K1: ingen data om mattransport spesielt |
| **R5** | Veterinær- og mattilsynsberedskap | Innsikt 11: bare Norge og Sverige er beskrevet |
| **R6** | Fra forskning til praksis | Innsikt 21: oppdrag er dokumentert, bruk er ikke |
| **R7** | Taus kunnskap og generasjonsskifte | Innsikt 5, 10 og hull K3 |
| **R8** | Sårbare husholdninger og kommunenes ansvar | Innsikt 12 og hull K4 |
| R9 | Sammenstilling | Kjøres sist |

Hvis tiden er knapp: kjør R1, R2 og R6 først.

## Felles lærdom fra kontrollen i runde 1

Promptene har strengere kilderegler fordi disse feilene gikk igjen i runde 1:
- Sitater som ikke var ordrette.
- Feil år, ofte publiseringsår i stedet for året dataene gjelder.
- Generiske lenker til et nettsted i stedet for selve dokumentet.
- Feil forfatter eller artikkel bak et tall.
- «Kilder» som bare var prosjektets egne filer.
- Oppdrag eller planer omtalt som om forskningen var tatt i bruk.
- Ambisjoner i erklæringer omtalt som forpliktelser.

---

## R1 – Offentlige måltider som beredskapsfunksjon

```text
Du skal gjøre et grundig kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om kompetanse og beredskap i nordiske matsystemer (Norge, Sverige, Danmark, Finland, Island). Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.
Dette er allerede kjent og skal ikke gjentas som hovedfunn:
- Sverige: ca. tre millioner offentlige måltider hver hverdag (SOU 2024:8); Livsmedelsverkets beredskapshandbok for offentlige måltider (2022); 60 % av kommunene hadde en form for beredskapsplan for måltider i 2021 (rapportert i NIL 2025); Söderköping har øvd siden 2022.
- Finland: Food Services Pool i forsyningsberedskapsorganisasjonen fra 2024.
- Danmark: Københavnermodellen i rundt 900 offentlige kjøkken (kvalitet og økologi, ikke beredskap).
- Under covid la finske skolekjøkken om til utlevering av nedkjølt eller fryst mat, og svenske kommuner hentet inn restaurantfagfolk.

Kompetansekoder: K1 praktisk i matkjeden, K2 institusjonell, K3 kunnskap i samfunnet, K4 husholdninger.

SPØRSMÅL
1. Finnes det tilsvarende krav, veiledere eller målinger av beredskap for offentlige måltider (skole, sykehjem, sykehus, hjemmetjeneste, forsvar) i Norge, Danmark, Finland og Island? Hvem har ansvaret?
2. Hva sier den svenske beredskapshandboken og NIL-rapporten konkret om kompetanse, bemanning, krisemenyer, lager, vann og matlaging uten strøm? Hvordan ble 60 %-tallet målt (år, spørsmål, utvalg)?
3. Hvordan er offentlige kjøkken organisert i hvert land (produksjonskjøkken, mottakskjøkken, sentralkjøkken, anbud til private), og hva sier kildene om hvordan organiseringen påvirker evnen til å lage mat ved leveransesvikt?
4. Hva gjør Finlands Food Services Pool i praksis (medlemmer, oppgaver, øvelser, veiledning)?
5. Finnes dokumenterte hendelser der offentlige måltider ble rammet av strømbrudd, vannbrudd, IT-bortfall eller leveransesvikt i Norden, og hvordan ble de håndtert?

KILDEREGLER
- Primærkilder først: lover, forskrifter, myndighetsveiledere, offisielle undersøkelser, evalueringer og forskning. Medier og bransjekilder er sekundære og skal merkes.
- Hver påstand: direkte URL til selve dokumentet (ikke bare nettstedet), utgiver, publiseringsdato, året dataene gjelder, lokator (side/avsnitt/tabell) og et ordrett sitat på høyst 25 ord. Sitatet må stå nøyaktig slik i kilden.
- Skill lov/krav, plan, veiledning, gjennomført aktivitet og evaluert effekt.
- Ikke finn på. Finner du ikke noe: skriv «ikke funnet i avgrenset søk» og hvilke søk du gjorde.
- Ikke bruk prosjektets egne dokumenter som kilde.
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt, hvert med kilde-ID og sikkerhet: godt dokumentert / delvis / svakt / omstridt)
B. Tabell per land: ansvar | krav eller veileder | måling av beredskap | øvelser | kilde-ID
C. Kjøkkenorganisering og beredskap – det kildene sier
D. Hendelser og håndtering
E. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,tall,enhet,data_aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: R1-NO-001 osv.; type: lov_eller_krav|veileder|tall|fakta|evaluering|case|forskningsfunn|tolkning; kildetype: primær|sekundær; sikkerhet: godt_dokumentert|delvis|svakt|omstridt)
F. Det vi ikke vet
G. Søkelogg (kort)
```

---

## R2 – Øvelser og læring etter hendelser i matforsyningen

```text
Du skal gjøre et grundig kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om kompetanse og beredskap i nordiske matsystemer (Norge, Sverige, Danmark, Finland, Island). Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.
Dette er allerede kjent:
- Norsk næringsberedskapslov gir hjemmel til å pålegge næringslivet øvelser (§ 6 h); kommunens beredskapsplan skal øves hvert annet år.
- Svensk forskrift (SFS 2022:524) krever samverkan og øving av beredskapsmyndigheter.
- Finland: pooler med opplæring og øving; TIETO20 (2020–21) var en kyberøvelse; TIETO26 (2026) har matforsyning som tema, men er ikke evaluert.
- Nordisk ministerråd: krisesimuleringen «Nordic Food Alert» (Stockholm, 8.–9. oktober 2024) med rapport TemaNord 2025:528.
- Danmark: Styrelsen for Samfundssikkerhed har et konsept for «læringsopsamling» etter forsyningskritiske hendelser.
- Ingen offentlige evalueringer av matøvelser er funnet i Norge, Sverige, Danmark eller Island.

SPØRSMÅL
1. Les TemaNord 2025:528 (Nordic Food Alert) i sin helhet. Hva ble øvd, hvem deltok (organisasjonstyper, ikke navn på privatpersoner), hvilket scenario ble brukt, og hva sier rapporten om kompetanse, roller, informasjonsdeling og koordinering?
2. Finn andre dokumenterte øvelser der matforsyning var tema i Norden 2015–2026: nasjonale totalforsvarsøvelser, regionale øvelser, bransjeøvelser (dagligvare, meieri, kornkjede), dyresykdomsøvelser med matkonsekvenser. Hva ble øvd, og finnes evalueringer?
3. Hva har SAMSIKs læringsopsamlinger og tilsvarende gjennomganger i andre land publisert om konkrete forsyningshendelser, og hva sier de om kompetanse og roller?
4. Hva sier forskning om hva som gjør øvelser og etterlæring effektive i kritisk infrastruktur, og finnes det nordiske studier av dette for mat?
5. Hvordan er evalueringer av øvelser organisert i hvert land (hvem evaluerer, publiseres de, følges de opp)?

KILDEREGLER
- Primærkilder først: øvelsesrapporter, evalueringer, myndighetsdokumenter og forskning. Medier og bransjekilder er sekundære og skal merkes.
- Hver påstand: direkte URL til selve dokumentet, utgiver, publiseringsdato, året hendelsen gjelder, lokator og et ordrett sitat på høyst 25 ord.
- Skill planlagt øvelse, gjennomført øvelse, arrangørens egen læringsrapport og uavhengig evaluering.
- Ikke oppgi navn på privatpersoner som deltok.
- Ikke finn på. Finner du ikke noe: skriv «ikke funnet i avgrenset søk» og hvilke søk du gjorde.
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Nordic Food Alert – sammendrag av scenario, deltakere og funn
C. Øvelsestabell: øvelse | land | år | tema | deltakertyper | evaluering (type, publisert ja/nei) | funn om kompetanse/koordinering | kilde-ID
D. Læring etter hendelser – det kildene sier
E. Hva forskningen sier om effektive øvelser
F. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,tall,enhet,data_aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: R2-NORD-001 osv.; type: lov_eller_krav|øvelse|evaluering|læringsrapport|fakta|forskningsfunn|tolkning)
G. Det vi ikke vet
H. Søkelogg (kort)
```

---

## R3 – Kritiske roller og personell i matkjeden

```text
Du skal gjøre et grundig kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om kompetanse og beredskap i nordiske matsystemer (Norge, Sverige, Danmark, Finland, Island). Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.
Dette er allerede kjent:
- Folk og kompetanse er ikke det samme: utilgjengelige folk, folk uten oppgavekompetanse og fagfolk som ikke er i yrket er tre ulike problemer.
- Strømbrudd ga 4,6 % lavere melkeproduksjon på finske gårder; Coop Sverige stengte ca. 700 av 800 butikker ved dataangrepet 2021, men ingen kilde viser om manuell drift var mulig.
- NAV anslo mangel på bl.a. 300 operatører i næringsmiddelproduksjon og 300 slaktere/fiskehandlere (2025). Svensk matindustri oppgir prosessteknikk, automasjon og vedlikehold som vanskeligst å rekruttere.
- Ingen kilde har tallfestet hvor mange fagfolk en matkjede kan miste før den stopper.

SPØRSMÅL
1. Hvilke yrker og funksjoner i matkjeden ble definert som samfunnskritiske under covid-19 i hvert land (lister over kritiske samfunnsfunksjoner og personell med rett til barnehage/skole, unntak fra karantene)? Hva sier listene om hvilke roller myndighetene regnet som kritiske?
2. Hvilke roller er kritiske for å holde møller, meierier, slakterier, fiskeforedling, bakerier og grossistlager i drift ved strømbrudd eller IT-bortfall? Finn bransjeveiledere, beredskapsplaner, forskning eller hendelsesrapporter som beskriver dette.
3. Finnes det kilder om hvor mye manuell drift og reserverutiner som finnes i dagligvarehandel og grossistledd (manuelt salg, betaling, lagerstyring) i Norden?
4. Hva sier kilder om sårbarhet ved at få nøkkelpersoner eller innleide teknikere og leverandører kan drifte automatiserte anlegg?
5. Finnes det studier eller evalueringer som forsøker å anslå minimumsbemanning eller terskler for kritiske funksjoner i mat eller tilsvarende sektorer?

KILDEREGLER
- Primærkilder først: myndighetslister og forskrifter, bransjeveiledere, hendelsesrapporter, evalueringer og forskning. Bransjekilder og medier er sekundære og skal merkes.
- Hver påstand: direkte URL til selve dokumentet, utgiver, publiseringsdato, året dataene gjelder, lokator og et ordrett sitat på høyst 25 ord.
- Skill mellom definert kritisk rolle, beskrevet sårbarhet, målt effekt og egen tolkning.
- Ikke trekk slutninger om beredskapseffekt som kildene ikke gjør.
- Ikke finn på. Finner du ikke noe: skriv «ikke funnet i avgrenset søk».
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Kritiske roller definert under covid, per land: land | dokument | matrelaterte roller | kilde-ID
C. Kritiske roller ved strømbrudd og IT-bortfall per verdikjedeledd
D. Manuell drift og reserverutiner – det kildene sier
E. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,tall,enhet,data_aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: R3-NO-001 osv.)
F. Det vi ikke vet
G. Søkelogg (kort)
```

---

## R4 – Transport, grossistledd og kjølekjede

```text
Du skal gjøre et grundig kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om kompetanse og beredskap i nordiske matsystemer (Norge, Sverige, Danmark, Finland, Island). Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.
Dette er allerede kjent:
- EURES 2025: lastebilsjåfør er mangelyrke i Norge og Sverige, overskuddsyrke i Finland. NAV anslo mangel på 400 lastebilsjåfører i Norge i 2025.
- Britisk sjåførmangel 2021 ble forsterket av etterslep i førerprøver og lav retensjon (House of Commons Transport Committee 2022).
- Finsk streik 2024: fagforbundet vedtok unntak for drivstoff til kritisk transport.
- Ingen nordiske data om sjåfører og kompetanse i mattransport spesielt er funnet.

SPØRSMÅL
1. Hvor mange arbeider med transport av mat og dagligvarer i hvert land, og hva vet vi om alder, rekruttering og andel utenlandske sjåfører (inkludert kabotasje og utenlandske transportfirma)?
2. Hvordan er dagligvaredistribusjonen organisert (antall sentrallagre, grossister, egen transport mot innleid), og hva sier kildene om konsentrasjon og sårbarhet?
3. Hvilken kompetanse og hvilke sertifikater kreves for kjøle- og frysetransport og for håndtering av mat i grossistledd (ATP, HACCP, internkontroll), og finnes data om tilgang på slik kompetanse?
4. Hva sier beredskapsdokumenter om transport av mat i krise (prioritering, drivstoff, forsvarets bruk av sivil transport, totalforsvar)?
5. Finnes nordiske hendelser der transport eller grossistledd stoppet (streik, vær, IT, drivstoff), og hvordan ble de håndtert?

KILDEREGLER
- Primærkilder først: offisiell statistikk, myndighetsdokumenter, regelverk, evalueringer og forskning. Bransjekilder og medier er sekundære og skal merkes.
- Hver påstand: direkte URL til selve dokumentet, utgiver, publiseringsdato, året dataene gjelder, lokator og et ordrett sitat på høyst 25 ord.
- Tall krever enhet, år, nevner og geografi. Ikke sammenlign land uten å skrive om definisjonene er like.
- Ikke finn på. Finner du ikke noe: skriv «ikke funnet i avgrenset søk».
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Faktatabell: indikator | land | verdi | enhet | år | nevner | kilde-ID | sammenlignbar (ja/delvis/nei)
C. Organisering av dagligvaredistribusjon og sårbarhet
D. Transport av mat i beredskapsplaner
E. Hendelser
F. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,tall,enhet,data_aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: R4-NO-001 osv.)
G. Det vi ikke vet
H. Søkelogg (kort)
```

---

## R5 – Veterinær- og mattilsynsberedskap

```text
Du skal gjøre et grundig kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om kompetanse og beredskap i nordiske matsystemer (Norge, Sverige, Danmark, Finland, Island). Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.
Dette er allerede kjent:
- Norge: gjennomgangen av veterinærtjenester (LMD 2023) viser presset dekning i distriktene, og at veterinærer i ordinær praksis ikke uten videre kan flyttes til sykdomsutbrudd.
- Sverige: SOU 2022:58 konkluderer med mangel på veterinærer og dyresykepleiere; EURES 2025 klassifiserer veterinær som mangelyrke i Sverige og Danmark.
- Sverige sluttet å krigsplassere veterinærpersonell etter 1995.
- Fødevarestyrelsen (DK) sender én utdannet forbindelsesoffiser til nasjonale krisemøter.

SPØRSMÅL
1. Hvordan er veterinærberedskap og vakt for produksjonsdyr organisert i Danmark, Finland og Island (offentlig ansvar, tilskudd, vaktordninger), og hva sier kildene om dekning?
2. Hvordan er mattilsynsmyndighetenes kriseorganisasjon bygget opp i alle fem land (Mattilsynet, Livsmedelsverket, Fødevarestyrelsen, Ruokavirasto, Matvælastofnun): beredskapsplaner, reservepersonell, øvelser?
3. Hva viste nyere dyresykdomsutbrudd eller øvelser (for eksempel fugleinfluensa, afrikansk svinepest, andre utbrudd i Norden) om kapasitet og kompetanse til utbruddsbekjempelse, avliving og mattrygghet?
4. Finnes data om antall offentlig ansatte veterinærer og inspektører i mattilsynet over tid, og om rekrutteringsproblemer?
5. Hvordan henger veterinærberedskap sammen med matforsyning i beredskapsdokumentene (kjøtt, melk, egg, slakteri)?

KILDEREGLER
- Primærkilder først: myndighetsrapporter, utredninger, evalueringer av utbrudd, årsrapporter og forskning. Bransjekilder og medier er sekundære og skal merkes.
- Hver påstand: direkte URL til selve dokumentet, utgiver, publiseringsdato, året dataene gjelder, lokator og et ordrett sitat på høyst 25 ord.
- Tall krever enhet, år, nevner og geografi.
- Ikke finn på. Finner du ikke noe: skriv «ikke funnet i avgrenset søk».
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Organisering per land: land | veterinærvakt | mattilsynets kriseorganisasjon | øvelser | kilde-ID
C. Erfaringer fra utbrudd og øvelser
D. Faktatabell over personell
E. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,tall,enhet,data_aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: R5-DK-001 osv.)
F. Det vi ikke vet
G. Søkelogg (kort)
```

---

## R6 – Fra forskning til praksis i matberedskap

```text
Du skal gjøre et grundig kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om kompetanse og beredskap i nordiske matsystemer (Norge, Sverige, Danmark, Finland, Island). Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.
Dette er allerede kjent:
- Flere forskningsmiljøer har utført oppdrag for myndigheter: IFRO (Københavns universitet) for Fødevarestyrelsen; Oslo Economics med NIBIO og SINTEF Ocean for Nærings- og fiskeridepartementet; Landbúnaðarháskóli Íslands for det islandske departementet (matsikkerhetsrapport 2021).
- Sverige: Formas finansierte fem forskningssentre for matberedskap i 2024 (ca. 60 mill. SEK hver).
- Island: utredningskontraktene for matlagre 2024–2025 hadde ikke krav om oppfølging (ministersvar 2026).
- Ingen kilde har vist at en mottaker faktisk brukte resultatene.
- Kunnskapsmeglere som finnes: Rådet for matvareberedskap (NO), NESA-pooler (FI), SAMSIK (DK).

VIKTIG SKILLE
Hold disse nivåene adskilt og merk hver påstand med ett av dem: (1) oppdrag eller finansiering, (2) rapport levert, (3) rapport omtalt eller sitert av mottaker, (4) dokumentert brukt i beslutning, regelverk, plan eller praksis, (5) evaluert effekt.

SPØRSMÅL
1. Finn eksempler der forskning eller utredninger om matberedskap er sitert i offentlige beslutningsdokumenter i Norden 2018–2026 (stortingsmeldinger, proposisjoner, SOU og propositioner, danske redegørelser, finske regjeringsbeslutninger, islandske stortingsdokumenter). Hva ble brukt, og til hva?
2. Finnes evalueringer av hvordan beredskapsforskning blir tatt i bruk (for eksempel evalueringer av forskningsprogrammer, NordForsk-programmer, Formas-sentre)?
3. Hvordan fungerer kunnskapsmeglere som Rådet for matvareberedskap, NESA-poolene og SAMSIK i praksis (mandat, møter, publikasjoner, eksempler på kunnskap som er delt)?
4. Hva sier forskning om hvorfor forskning på importerstatning og matsystemomstilling ofte ikke blir tatt i bruk («kollapser i impact»)?
5. Hvilke nordiske eksempler finnes der forskning om matberedskap ledet til endret lagerordning, regelverk eller øvelsespraksis?

KILDEREGLER
- Primærkilder først: offentlige beslutningsdokumenter, evalueringer, programrapporter og forskning. Institusjonenes egne nyhetsartikler er sekundære for påstander om bruk og skal merkes.
- Hver påstand: direkte URL til selve dokumentet, utgiver, publiseringsdato, lokator og et ordrett sitat på høyst 25 ord. For sitering i beslutningsdokumenter: oppgi dokumentets side og hva som står der.
- Ikke skriv at forskning er «tatt i bruk» uten belegg på nivå 3 eller høyere.
- Ikke skriv noe om hvorvidt miljøer vil samarbeide.
- Ikke finn på. Finner du ikke noe: skriv «ikke funnet i avgrenset søk».
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Casetabell: case | land | forskningsmiljø | mottaker | høyeste dokumenterte nivå (1–5) | belegg | kilde-ID
C. Kunnskapsmeglere – hvordan de fungerer
D. Hva forskningen sier om barrierer for bruk
E. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,niva,tall,enhet,data_aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: R6-NO-001 osv.; niva: 1–5 etter skillet over)
F. Det vi ikke vet
G. Søkelogg (kort)
```

---

## R7 – Taus kunnskap og generasjonsskifte i matproduksjonen

```text
Du skal gjøre et grundig litteratur- og kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om kompetanse og beredskap i nordiske matsystemer (Norge, Sverige, Danmark, Finland, Island). Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.
Dette er allerede kjent:
- Sverige: brukeren er over 60 år på 48 % av jordbruksforetakene (2025); knapt en fjerdedel av brukerne 60–80 år har etterfølger klar (Jordbruksverket 2026).
- Norge: 36 627 jordbruksbedrifter (2025), arbeidsinnsatsen falt fra 120 til 75 mill. timeverk (2004/05–2023). Finland: gjennomsnittsalder 55 år (2024).
- Bornholm: aktører knyttet tap av frukt- og grøntkompetanse til spesialisering i animalsk produksjon (TemaNord 2022:528). En finsk ekspertmodell (Rikkonen mfl. 2026) beskriver spesialisering som kilde til både oppdatert fagkompetanse og mindre mangfold.
- Svensk restaurantstudie (Sundqvist og Marshall 2025): konserveringskunnskap forsvant når nøkkelpersoner sluttet.
- Svenske historikere: kunnskap i matberedskapen «delvis gått förlorad» etter den kalde krigen.

SPØRSMÅL
1. Hva sier nordisk forskning om hvordan praktisk kunnskap overføres ved generasjonsskifte i jordbruk, fiske og matforedling (familieoverdragelse, læretid, rådgivning, fagskoler)? Hva går tapt og hva bevares?
2. Finnes studier av kunnskap som har forsvunnet eller er i ferd med å forsvinne i nordisk matproduksjon (for eksempel lokale kornsorter og dyrking, konservering, slakting på gård, småskala foredling, beredskapslagring)?
3. Hvordan påvirker rådgivningstjenester (Norsk Landbruksrådgiving, Hushållningssällskapen, SEGES, ProAgria, RML) kompetansen i primærproduksjonen, og finnes evalueringer?
4. Hva sier forskning om nyetablerte bønder og bønder uten landbruksbakgrunn: hvor lærer de, og hva mangler?
5. Finnes nordiske eller europeiske studier som kobler kunnskapsbredde eller -tap i jordbruket til evne til å tilpasse seg sjokk (tørke, fôrmangel, prissjokk)?

KILDEREGLER
- Primærkilder først: fagfellevurdert forskning, offisiell statistikk, evalueringer og offentlige utredninger. Bransjekilder og medier er sekundære og skal merkes.
- Hver påstand: direkte URL (helst DOI), forfattere, år, lokator og et ordrett sitat på høyst 25 ord. Kontroller at forfatter og artikkel faktisk hører sammen.
- Merk om flere publikasjoner bygger på samme datamateriale; de er da ikke uavhengige.
- Ikke finn på. Finner du ikke noe: skriv «ikke funnet i avgrenset søk».
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Hvordan praktisk kunnskap overføres – mekanismer og funn
C. Kunnskap som er dokumentert tapt eller truet
D. Rådgivning og nyetablerte – det kildene sier
E. Kobling til tilpasningsevne ved sjokk
F. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,tall,enhet,data_aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: R7-SE-001 osv.)
G. Det vi ikke vet
H. Søkelogg (kort)
```

---

## R8 – Sårbare husholdninger og kommunenes ansvar for mat i krise

```text
Du skal gjøre et grundig kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om kompetanse og beredskap i nordiske matsystemer (Norge, Sverige, Danmark, Finland, Island). Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.
Dette er allerede kjent:
- Råd om egenberedskap: Norge og Sverige én uke, Danmark tre døgn, Finland 72 timer; Island (Røde Kors) tre dager.
- Selvrapportert beredskap: NO 74 % tørrmat «noen dager» (2025); SE 73 % mat for en uke (2023); FI 85 % mat for tre dager og 59 % erfaring med matlaging uten strøm (2025).
- Eldre oppgir bedre lager enn unge, men undersøkelsene sier lite om de eldste og hjelpetrengende. I Finland er unge, lavinntekt og byboere dårligere forberedt.
- DSB: mottakere av helsetjenester hjemme skal få hjelp i krise, men det kan ta lengre tid.
- Ingen representative målinger for personer med særlige kostbehov er funnet.

SPØRSMÅL
1. Hvilket ansvar har kommunene i hvert land for matforsyning til hjemmeboende som får hjemmetjenester, matombringing eller omsorg, når vanlige leveranser svikter? Finn lover, veiledere og beredskapsplaner.
2. Finnes kartlegginger av hvor mange som er avhengige av matombringing eller hjelp til mat, og hva vet vi om beredskapen for dem?
3. Hva sier kilder om matforsyning til personer med særlige kostbehov i krise (sondemat, konsistenstilpasset kost, allergier, diabetes)?
4. Hvilken rolle har frivillige organisasjoner (Røde Kors, Sanitetskvinner, Matsentralen, matbanker) i matforsyning i krise i hvert land, og hva sier evalueringer av deres innsats (for eksempel under covid eller naturhendelser)?
5. Hva viser erfaringer fra langvarige strømbrudd eller naturhendelser i Norden om matsituasjonen for sårbare husholdninger?

KILDEREGLER
- Primærkilder først: lover, veiledere, offentlige undersøkelser, evalueringer og forskning. Organisasjonenes egne sider er primære for egen virksomhet, men sekundære for effekt, og skal merkes.
- Hver påstand: direkte URL til selve dokumentet, utgiver, publiseringsdato, året dataene gjelder, lokator og et ordrett sitat på høyst 25 ord.
- Skill råd, ansvar på papiret, målt beredskap og erfaring fra faktiske hendelser.
- Ikke samle opplysninger om enkeltpersoner.
- Ikke finn på. Finner du ikke noe: skriv «ikke funnet i avgrenset søk».
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Kommunenes ansvar per land: land | hjemmel/veileder | hva ansvaret omfatter | kilde-ID
C. Særlige kostbehov – det kildene sier
D. Frivillige organisasjoners rolle og evalueringer
E. Erfaringer fra hendelser
F. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,tall,enhet,data_aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: R8-NO-001 osv.)
G. Det vi ikke vet
H. Søkelogg (kort)
```

---

## R9 – Sammenstilling (kjøres etter R1–R8, med svarene lastet opp)

```text
Jeg har lastet opp åtte researchleveranser (R1–R8) om kompetanse og beredskap i nordiske matsystemer. Ikke still oppklarende spørsmål. Ikke gjør ny research på nettet, med ett unntak: du kan åpne en kilde for å kontrollere en påstand der leveransene er i motstrid.

OPPGAVE
Lag et samlet kunnskapsgrunnlag som forklarer det nye materialet. Ikke skriv anbefalinger eller tiltak.

1. Hovedinnsikter på tvers (10–12 avsnitt). Hver innsikt skal vise hvilke påstands-ID-er den bygger på, og hvor sikker den er (godt dokumentert / delvis / svakt / omstridt).
2. Hva runde 2 endrer: hvilke tidligere antakelser som styrkes, svekkes eller nyanseres. (Tidligere hovedfunn: kompetanse virker innenfor fysiske rammer; folk og kompetanse er ikke det samme; plikt til å øve er dokumentert, men ikke effekten; forskning er dokumentert som oppdrag, ikke som bruk; offentlige måltider er et sted der kompetanse og beredskap møtes.)
3. Motstrid mellom leveransene, med forklaring (definisjon, år, kilde).
4. Svake punkter: påstander som bare har sekundærkilde, mangler lokator eller er merket svakt.
5. De viktigste kunnskapshullene som gjenstår, gruppert etter K-kode (K1 praktisk, K2 institusjonell, K3 kunnskap i samfunnet, K4 husholdninger) og land.
6. Samlet påstandstabell: slå sammen alle CSV-blokkene, behold opprinnelige ID-er, fjern eksakte duplikater og legg til kolonnen «motstrid_med».

Skriv på norsk bokmål. Skill tydelig mellom det kildene sier og din sammenstilling.
```
