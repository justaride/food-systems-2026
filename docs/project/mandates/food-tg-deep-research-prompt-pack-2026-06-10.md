---
tittel: Food TG Deep Research Prompt Pack 2026-06-10
status: Aktiv intern
eier: Gabriel
dato: 2026-06-10
scope: Detaljerte Deep Research-prosesser for 09.06-/10.06-casegrunnlaget.
relaterte_filer:
  - docs/project/mandates/food-tg-deep-research-source-intake-2026-06-10.md
  - docs/project/mandates/food-tg-case-shortlist-addendum-2026-06-09.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/food-tg-claim-lock-table-2026-05.md
  - docs/project/mandates/food-tg-casekort-og-research-mottak-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-results-intake-2026-06-10.md
---

# Food TG Deep Research Prompt Pack 2026-06-10

Dette dokumentet er en operativ prompt-pakke for ChatGPT Deep Research, Perplexity, Gemini eller tilsvarende researchverktøy. Målet er ikke flere brede sammendrag, men mer kvalitative uttak som kan mates direkte tilbake i `SRC-0906-*`, `PCQ-0906-*`, claim-lock og casekort.

## Bruksregel

Deep Research-output er ikke ekstern faktastemme. Outputen er et kildejakt- og valideringsgrunnlag som må innom prosjektets kontrollstack før bruk:

1. `food-tg-deep-research-results-intake-2026-06-10.md` for resultatlogg når output er mottatt.
2. `food-tg-casekort-og-research-mottak-2026-06-10.md` for registrering, casekortstatus og importbeslutning.
3. `source-shortlist-food-tg.md` for ny eller forbedret kilde.
4. `primary-check-queue-food-tg-v0.1.md` for primærkilde, data eller aktørgate.
5. `food-tg-claim-lock-table-2026-05.md` før noe brukes i faktastemme.
6. `actor-validation-pack-food-tg-v0.1.md` når funn krever aktørbekreftelse eller bruksrett.

Hver kjøring skal gi ett av disse resultatene per case: `deckklart internt`, `needs-primary-check`, `needs-data`, `needs-actor-validation`, `benchmark-only`, `watchlist` eller `parkert`.

## Anbefalt arbeidsflyt

1. Velg ett case. Ikke kjør alle syv i samme Deep Research-tråd.
2. Kopier først **Masterprompten** under.
3. Kopier deretter relevant **caseprompt**.
4. Be verktøyet prioritere primærkilder og eksplisitt rapportere negative funn.
5. Lagre outputen med filnavn `deep-research-0906-<case>-YYYY-MM-DD.md`.
6. Kjør **Valideringsprompten** på outputen.
7. Registrer resultatet i `food-tg-deep-research-results-intake-2026-06-10.md` og deretter i `food-tg-casekort-og-research-mottak-2026-06-10.md`.
8. Importer bare kilder, claims og neste handlinger som består kontrollspørsmålene.

## Kvalitetskontrakt

Hver researchkjøring skal:

- prioritere primærkilder: offentlige dokumenter, aktørsider, årsrapporter, prosjektarkiv, regulatoriske sider, datasett, fagrapporter og fagfellevurderte artikler;
- oppgi tittel, eier/utgiver, dato, URL, dokumenttype og hva kilden faktisk beviser;
- skille mellom funnet kilde, rimelig inferens, sekundær omtale og ikke funnet;
- lete etter motstridende kilder og oppdatert status;
- oppgi søkestrenger på norsk, engelsk og lokalt språk der relevant;
- markere når noe bare er benchmark, policykontekst eller watchlist;
- formulere `ikke si`-punkter som hindrer overclaiming.

Deep Research skal ikke:

- fylle hull med generiske trendavsnitt;
- bruke sekundær omtale som bevis for avtale, partnerrolle, volum eller effekt;
- gjøre juridiske eller reputasjonelt sensitive aktørclaims uten primærkilde;
- blande EU-scope, norsk rett, aktørpraksis og markedsdata i samme konklusjon;
- løfte `SRC-0906-*` eller `PCQ-0906-*` til siterbar status alene.

## Masterprompt

Kopier denne først i hver Deep Research-kjøring.

```text
Du er researchanalytiker for Food Systems Transition Group i Natural State. Oppgaven er å validere et avgrenset casegrunnlag, ikke å skrive et generelt essay.

Arbeidsregel:
- Prioriter primærkilder først: offentlige myndighetssider, regulatoriske dokumenter, offisielle prosjektarkiv, aktørers egne rapporter/sider, institusjonsrapporter, datasett og fagfellevurdert forskning.
- Bruk sekundærkilder bare som spor til primærkilder eller som tydelig merket kontekst.
- Skill alltid mellom: (1) dokumentert fakta, (2) plausibel inferens, (3) sekundær omtale, (4) ikke funnet, (5) motbevist eller svekket.
- Rapporter negative funn eksplisitt. Hvis en MOU, avtale, aktørrolle, datakilde eller pilotstatus ikke finnes, skriv det tydelig.
- Ikke fyll hull med generisk bakgrunnstekst.
- Ikke konkluder sterkere enn kildene tillater.

Prosjektets kontrollspråk:
- "deckklart internt" = kan brukes som intern slide/hypotese med caveat.
- "needs-primary-check" = krever primærkilde, regulatorisk tekst eller institusjonsrapport før faktastemme.
- "needs-data" = krever tall med år, geografi, enhet, metode og kildeeier.
- "needs-actor-validation" = krever aktørbekreftelse, bruksrett eller kontaktpunkt.
- "benchmark-only" = nyttig sammenligningscase, men ikke bevis for norsk/nordisk pilot.
- "watchlist" = interessant, men ikke nok til casekort nå.
- "parkert" = bør ikke videreføres uten ny informasjon.

Leveranseformat:
1. Kort svar først: bør caset modnes, holdes som benchmark, valideres videre eller parkeres?
2. Claim-test-tabell med kolonner: claim/hypotese, funn, sterkeste kilde, hva kilden beviser, hva den ikke beviser, status.
3. Kildeledger med kolonner: kilde-ID, tittel, eier/utgiver, dato, URL, dokumenttype, primær/sekundær, relevant locator/side/avsnitt, bruksverdi, svakhet.
4. Datauttrekkstabell hvis tall finnes: metrikk, verdi, enhet, år, geografi, metode, kilde, begrensning.
5. Aktør-/dokumenteierkart: aktør, mulig rolle, dokumentbehov, kontakt-/eierskapssignal, status.
6. "Ikke si"-liste med påstander som ikke støttes.
7. Neste 5 handlinger rangert etter hva som mest effektivt kan validere eller drepe caset.
8. Søkestrenger brukt eller anbefalt videre, inkludert norsk, engelsk og lokalt språk der relevant.

Gi presise kilder og URL-er. Hvis du ikke finner primærkilde for en sentral påstand, skal det være et hovedfunn.
```

## Caseprompt 1: Brasil, kaffe, MOU og EUDR

Kobling: `SRC-0906-001`, `SRC-0906-003`, `PCQ-0906-001`, `PCQ-0906-003`.

```text
Case: Brasil, kaffe, mulig MOU/prosjekt og kaffe som importverdikjede-/EUDR-case.

Valider disse hypotesene:
1. Finnes det en dokumentert MOU, avtale, møtenotat, programside eller dokumenteier som kobler Nordic Circular Hotspot, WCEF, Nordic Night, Natural State, NCH eller relevante norske/nordiske aktører til Brasil og kaffe?
2. Finnes det et konkret kaffeprosjekt, ikke bare generell handels- eller EUDR-kontekst?
3. Har Fuglen, Norsk Kaffeinformasjon, norske importører, brennerier eller andre navngitte aktører en dokumentert rolle som partner, datakilde eller relevant kontakt?
4. Hvilke primærkilder dokumenterer kaffeimport, opprinnelse, sporbarhet, EUDR-eksponering eller brasiliansk råvarekjede for nordiske aktører?
5. Finnes det dokumentert casegrunnlag for kaffegrut, kaffeavfall, biogass eller høyverdig bruk som kan kobles til Food TG, eller er dette bare generell sidestrømshypotese?

Prioriter kildetyper:
- MOU/avtaletekst, eventprogram, møteagenda, pressemelding, deltakerliste, presentasjon eller dokumenteier.
- EU/EUDR-primærkilder, brasilianske myndighets-/sektorrapporter, toll-/importstatistikk, aktørers sporbarhetsrapporter.
- Kaffeaktørers egne sustainability-/sourcing-sider.
- Fagrapporter om kaffegrut/kaffeavfall bare hvis de har volum, teknologi, pilot eller off-taker.

Søkestrenger:
- "Nordic Circular Hotspot" Brazil coffee MOU
- "Natural State" Brazil coffee circular food
- "WCEF" Brazil coffee Nordic
- "Nordic Night" Brazil coffee sustainability
- "Fuglen" Brazil coffee sustainability sourcing
- "Norsk Kaffeinformasjon" Brasil kaffe import sporbarhet
- "EUDR" coffee Brazil Norway importer
- "coffee grounds" Norway biogas circular food
- portugisisk: "café Brasil acordo cooperação Noruega circular"

Outputkrav:
- Skill mellom Brasil-relasjon, kaffeprosjekt, EUDR-kontekst og kaffeavfall.
- Hvis MOU/prosjektdokument ikke finnes, skriv "MOU/prosjektdokument ikke funnet" som hovedfunn.
- Ikke bruk kaffe/EUDR-kilder som bevis for partnerrolle.
- Foreslå om caset skal stå som `needs-source`, `needs-actor-validation`, `deckklart internt` eller `parkert`.
```

## Caseprompt 2: Elfenbenskysten, kakao, avtale og sporbarhet

Kobling: `SRC-0906-002`, `PCQ-0906-002`.

```text
Case: Elfenbenskysten/Côte d'Ivoire, kakao, mulig MOU/relasjon og EUDR-/sporbarhetscase.

Valider disse hypotesene:
1. Finnes det dokumentert avtale, MOU, samarbeidsrelasjon, programside eller dokumenteier som kobler Nordic Circular Hotspot, Natural State, WCEF, NCH eller nordiske aktører til Côte d'Ivoire og kakao?
2. Hvilke primærkilder dokumenterer kakao, sporbarhet, EUDR, avskogingsrisiko og nordisk import-/verdikjederelevans?
3. Finnes det konkrete nordiske aktører, kjøpere, sertifiseringsaktører eller prosjektmiljøer med dokumentert rolle?
4. Finnes det seriøst casegrunnlag for kakaoreststrømmer, biprodukter eller sirkulær bioøkonomi i Côte d'Ivoire, eller er feltet fortsatt pilot-/roadmap?

Prioriter kildetyper:
- Avtale, MOU, møtenotat, deltakerliste, prosjektarkiv, pressemelding.
- EU/EUDR-primærkilder, myndighets-/sektorrapporter fra Côte d'Ivoire, International Cocoa Organization, World Bank/IFC, EU, FAO, UNIDO.
- Aktørkilder fra nordiske sjokolade-/kakaoaktører hvis de har sourcing, sporbarhet eller geografi.
- Fagrapporter om cocoa pod husk, cocoa shell, biorefinery eller biochar bare hvis de har konkret lokasjon, volum, pilotstatus og aktør.

Søkestrenger:
- "Nordic Circular Hotspot" "Côte d'Ivoire" cocoa
- "Natural State" "Côte d'Ivoire" cocoa
- "WCEF" "Côte d'Ivoire" cocoa circular economy
- "Côte d'Ivoire" cocoa EUDR traceability Nordic
- "Ivory Coast" cocoa traceability Norway Sweden Denmark
- "cocoa pod husk" Côte d'Ivoire circular economy pilot
- fransk: "Côte d'Ivoire cacao accord coopération économie circulaire Norvège"

Outputkrav:
- Skill mellom relasjonsclaim, EUDR-/sporbarhetsclaim og reststrømsclaim.
- Hvis avtale eller organisasjonsnavn ikke finnes, skriv det tydelig.
- Ikke gjør kakaoreststrømmer til skalert løsning uten pilot-/aktørkilde.
- Foreslå om caset skal modnes, holdes som relasjonshypotese eller parkeres.
```

## Caseprompt 3: Valio, finsk meieri og fôrgovernance

Kobling: `SRC-0906-006`, `PCQ-0906-006`, `CL-A-020`, `CL-C-001`.

```text
Case: Valio/Finland som governance- og fôrråvarecase.

Valider disse hypotesene:
1. Er Valio dokumentert som soyafri melkefôr-/dairy-feed governance-case?
2. Hva sier primærkilder faktisk om Valios bruk av soya, raps/canola, erter, bønner, gras, biprodukter og importerte fôrråvarer?
3. Finnes det dokumentasjon for lokal/finsk proteinandel, importandel, leverandørkrav eller innkjøpsstandarder?
4. Kan Valio/Finland brukes som Food TG-case uten å påstå "importfritt fôr"?
5. Hvilke finske institusjonskilder kan gi fôr-, protein-, meieri- eller selvforsyningsdata?

Prioriter kildetyper:
- Valio egne sustainability reports, animal welfare/farm requirements, feed/sourcing policies.
- A-Rehu, Luke, VTT, MMM, Natural Resources Institute Finland, Finnish Food Authority.
- Fagrapporter om domestic protein crops, feed balance, dairy feed basket.
- Import-/handelsstatistikk bare hvis varenummer, år, geografi og metode er tydelig.

Søkestrenger:
- Valio soy free dairy feed Finland
- Valio vastuullisuus rehu soija
- Valio sustainability report feed soy
- A-Rehu Valio protein feed soy-free
- Luke Finland dairy feed protein self-sufficiency
- Finnish dairy feed domestic protein crops
- finsk: Valio rehu soija maitotilat vastuullisuus

Outputkrav:
- Skill "soyafri" fra "importfri".
- Lag tabell over fôrråvarer med dokumentert opprinnelse hvis mulig.
- Marker datagap for importandel, år og geografi.
- Skriv trygg formulering som kan brukes internt, og en "ikke si"-formulering for importfritt fôr.
- Foreslå status: `deckklart internt med caveat`, `needs-data` eller `needs-actor-validation`.
```

## Caseprompt 4: Bama, grøntgrossistledd og adoption-gate

Kobling: `SRC-0906-004`, `PCQ-0906-004`, `CL-C-001`, `CL-C-006`, `CL-C-015`.

```text
Case: Bama/frukt-grønt/distribusjon som C-gate for adoption, markedsstruktur og lokal produksjon.

Valider disse hypotesene:
1. Hva kan dokumenteres om norsk frukt- og grøntdistribusjon, grossistledd, kjedemakt og innkjøpsstruktur?
2. Hva kan dokumenteres spesifikt om Bamas rolle uten å gjøre usikre eller juridisk sensitive claims?
3. Finnes det primærkilder for importandel, sesong, vinterimport, pris-/marginstruktur eller logistikkbarrierer?
4. Finnes det dokumentert kobling mellom grossist-/distribusjonsstruktur og adoption av veksthus, hydroponi, vertical farming eller lokal produksjon?
5. Bør caset hete "Bama", "grøntgrossistledd" eller bredere "distribusjon/adoption-gate"?

Prioriter kildetyper:
- Bama årsrapporter/sustainability/leverandørkrav.
- Konkurransetilsynet, Dagligvaretilsynet, Menon, SSB, Landbruksdirektoratet, NIBIO, Mattilsynet.
- Offentlige rapporter om dagligvaremarked, grossistledd, import, norskandel og prisdannelse.
- Aktørkilder fra veksthus/vertical farming bare hvis de dokumenterer salgs-/distribusjonsbarrierer.

Søkestrenger:
- Bama frukt grønt import andel årsrapport
- Bama grossist distribusjon dagligvare Norge konkurransetilsynet
- Menon frukt grønt verdikjede Norge grossist
- Dagligvaretilsynet Bama leverandører frukt grønt
- Norge vinterimport grønnsaker marginer dokumentasjon
- vertical farming Norway grocery distribution barriers

Outputkrav:
- Ikke konkluder at Bama blokkerer aktører eller har bestemte marginer uten primærkilde.
- Skill dokumentert markedsstruktur fra aktørpåstand.
- Lag trygg C-gate-formulering for intern deckbruk.
- Marker hvilke claims som krever juridisk/aktørvalidering.
- Foreslå om dette skal være `deckklart internt som C-gate`, `needs-primary-check` eller `parkert`.
```

## Caseprompt 5: Spillvarme, drivhus, akvaponikk og matproduksjon

Kobling: `SRC-0906-005`, `PCQ-0906-005`, `CL-B-023`, `CL-C-015`.

```text
Case: Nordisk spillvarme til drivhus, akvakultur, akvaponikk eller annen matproduksjon.

Valider disse hypotesene:
1. Hvilke konkrete nordiske prosjekter bruker, planlegger eller dokumenterer spillvarme til matproduksjon?
2. For hvert prosjekt: er det operativt, under bygging, planlagt eller bare konsept?
3. Finnes det data for MW, GWh/år, temperaturprofil, sesong, reservevarme, CAPEX/OPEX, eier, kjøper/off-taker og faktisk matproduksjon?
4. Finnes det regulatoriske eller kommunale kost-nytteanalyser som skiller elektrisk datasenterkapasitet fra nyttiggjort varme?
5. Hvilke case er relevante benchmark, og hvilke bør ikke brukes?

Prioriter kildetyper:
- Kommunale planvedlegg, konsesjon, energirapport, kost-nytteanalyse, fjernvarmeselskap.
- Prosjekteiers egne data og årsrapporter.
- Forskningsinstitusjoner eller energimyndigheter.
- Media bare som inngang til primærkilde.

Startkandidater å sjekke:
- Frövi / Regenergy / WA3RM
- Wiig Gartneri / Green Horizon
- Polar DC DRA02 / Nord-Norge
- Green Mountain / Hima
- Varde/Kragerø eller andre norske/nordiske varme-/veksthuskoblinger

Søkestrenger:
- waste heat greenhouse Nordic data center GWh temperature
- spillvarme drivhus datasenter Norge GWh
- restvärme växthus datacenter Sverige Frövi
- overskudsvarme drivhus Danmark akvakultur
- data center waste heat aquaculture Nordic

Outputkrav:
- Lag caseledger med operativ status, energimengde, temperatur, eier, mottaker, matkobling og datakvalitet.
- Ikke oppgi ett nasjonalt TWh-potensial uten primærkilde og metode.
- Skilj nyttiggjort varme fra elektrisk kapasitet.
- Foreslå `benchmark-radar`, `needs-data`, `needs-primary-check` eller `parkert`.
```

## Caseprompt 6: Island/100% Fish og norsk marint restråstoff

Kobling: `PCQ-B-005`, marint restråstoff-case i 09.06-addendum, claim-lock rad om 100% Fish.

```text
Case: Iceland Ocean Cluster / 100% Fish som benchmark for høyverdiutnyttelse av marint restråstoff og overførbarhet til Norge.

Valider disse hypotesene:
1. Hva dokumenterer 100% Fish/Iceland Ocean Cluster faktisk om full utnyttelse, produktkaskade, høyverdiutnyttelse og clusterlogikk?
2. Hvilke data finnes for islandsk fiskeråstoff, restråstoff, sluttbruk og verdiskaping?
3. Hva finnes av norsk primærdata for marint restråstoff, fraksjoner, utnyttelsesgrad, uutnyttet volum, sluttbruk og høyverdiandel?
4. Hvilke norske aktører, rapporter eller programmer er relevante for overførbarhet?
5. Hva må være sant for at 100% Fish kan brukes som designbenchmark uten å bli norsk pilotbevis?

Prioriter kildetyper:
- Iceland Ocean Cluster, 100% Fish, Matís, islandske myndigheter/sektorrapporter.
- SINTEF, FHF, Nofima, SUPREME, Fiskeridirektoratet, Sjømat Norge.
- Fagrapporter om seafood sidestream valorisation, hydrolysater, kollagen, olje, mel, ingredienser.
- Aktørkilder bare hvis de dokumenterer fraksjon, volum, sluttbruk eller off-taker.

Søkestrenger:
- Iceland Ocean Cluster 100% Fish utilization report
- 100% Fish Iceland data cod by-products value
- Matís fish by-products Iceland utilization
- SINTEF marint restråstoff 2024 utnyttelse sluttbruk
- FHF restråstoff sjømat høyverdiutnyttelse
- Nofima marine by-products Norway valorisation

Outputkrav:
- Skill total utnyttelse fra høyverdiutnyttelse.
- Skill benchmark/designkrav fra norsk pilotbevis.
- Lag norsk gap-tabell: fraksjon, dagens sluttbruk, høyverdi-mulighet, datagap, aktørbehov.
- Foreslå trygg intern slideformulering og "ikke si"-liste.
- Foreslå status: `benchmark-only`, `deckklart internt med claim-lock`, `needs-primary-check` eller `needs-actor-validation`.
```

## Caseprompt 7: Skottland og Polen som benchmark/watchlist

Kobling: `SRC-0906-007`, `SRC-0906-008`, `PCQ-0906-007`.

```text
Case: Skottland og Polen som mulige benchmarkland for sidestrømmer, bioressurser, akvakultur, fiskeri, matindustriavfall og sirkulær bioøkonomi.

Valider disse hypotesene:
1. Har Skottland konkrete primærkilder, rapporter eller programmer som gjør landet til et seriøst benchmark for bioressurskartlegging, sjømat, havbruk, fiskeri eller sidestrømmer?
2. Har Polen konkrete primærkilder, rapporter eller programmer som gjør landet til et direkte Food TG-case for sidestrømvalorisering, eller er Polen bedre som governance/statistikk/matsvinn-watchlist?
3. Hvilke fem kilder for Skottland bør fulltekstkontrolleres først?
4. Hvilke polske kilder finnes for fiskeri, akvakultur, matsvinn, matindustriavfall eller bioøkonomi, og hva mangler for konkret casebruk?
5. Bør Skottland og Polen behandles separat i videre arbeid?

Prioriter kildetyper:
- Skotske myndigheter, Zero Waste Scotland, SEPA, Seafood Scotland, Scottish Government, Highlands and Islands Enterprise, akademiske/institusjonsrapporter.
- Polske myndigheter, statistikkbyrå, EU-programmer, matsvinn-/bioøkonomirapporter, fiskeri-/akvakulturstatistikk.
- EU-prosjekter bare hvis lokasjon, aktør, volum og output er tydelig.

Søkestrenger:
- Scotland circular bioeconomy seafood by-products report
- Zero Waste Scotland food waste fisheries aquaculture by-products
- Scottish Government bioresources aquaculture waste valorisation
- Scotland seafood sidestreams circular economy
- Poland food industry by-products circular bioeconomy report
- Poland fishery aquaculture by-products food waste statistics
- polsk: Polska odpady przemysłu spożywczego bioekonomia cyrkularna

Outputkrav:
- Del Skottland og Polen i separate vurderinger.
- Lag topp-5 fulltekstliste for Skottland med begrunnelse.
- Lag Polen-watchlist med hva som finnes og hva som mangler.
- Ikke si at Polen er stor sidestrømsmulighet uten konkret masse-/aktørdata.
- Ikke si at Skottland er dokumentert Food TG-case før fulltekst er primærsjekket.
- Foreslå status per land: `benchmark-kandidat`, `watchlist`, `needs-primary-check` eller `parkert`.
```

## Valideringsprompt etter Deep Research-output

Kjør denne etter hver case-output. Lim inn hele researchrapporten under prompten.

```text
Du skal nå kvalitetssikre en Deep Research-output for Food Systems Transition Group. Ikke skriv ny research. Ekstraher, kontroller og klassifiser materialet.

Bruk disse statusene:
- deckklart internt
- needs-primary-check
- needs-data
- needs-actor-validation
- benchmark-only
- watchlist
- parkert

Oppgave:
1. Lag en kort dom: hva kan prosjektet bruke nå, hva må valideres, og hva bør ikke brukes?
2. Finn alle konkrete claims i outputen. For hvert claim: støttet, delvis støttet, ikke støttet, motbevist eller uklart.
3. Lag kildeledger med: tittel, eier, dato, URL, dokumenttype, primær/sekundær, locator, hva den beviser, hva den ikke beviser.
4. Marker hvilke kilder som kan bli `SRC-0906-*`-forbedringer, og hvilke bare er bakgrunn.
5. Marker hvilke funn som påvirker `PCQ-0906-*`, og skriv nøyaktig neste primary-check.
6. Marker claim-lock-effekt: åpner ingen claim, styrker caveat, svekker claim, krever actor validation, eller kan brukes internt med forbehold.
7. Skriv "ikke si"-liste.
8. Skriv maks 5 neste handlinger i prioritert rekkefølge.

Lever i denne tabellen først:

| Felt | Svar |
|---|---|
| Case |  |
| Foreslått status |  |
| Sterkeste kilde |  |
| Svakeste kritiske punkt |  |
| Kan brukes internt nå? |  |
| Kan brukes eksternt nå? | Nei, med mindre primærkilde/claim-lock sier noe annet |
| Neste handling |  |

Deretter:

| Claim | Støttestatus | Kilde | Hva kilden beviser | Hva den ikke beviser | Kontrollhandling |
|---|---|---|---|---|---|

| Kilde | Type | Eier/dato | Primær? | Bruksverdi | Svakhet | Foreslått import |
|---|---|---|---|---|---|---|

Ikke pynt på outputen. Hvis rapporten mangler primærkilde for hovedclaimet, gjør det til hovedkonklusjon.
```

## Resultatmal for import tilbake til prosjektet

Bruk denne tabellen når en ny Deep Research-output skal vurderes for import i repoet.

| Felt | Verdi |
|---|---|
| Researchfil |  |
| Dato kjørt |  |
| Prompt brukt | Master + caseprompt nr.  |
| Case-ID | DRI-/SRC-/PCQ-kobling |
| Kort dom |  |
| Foreslått status |  |
| Nye primærkilder |  |
| Nye sekundærkilder |  |
| Claims styrket |  |
| Claims svekket |  |
| Claims holdt tilbake |  |
| Nye datagap |  |
| Nye actor-asks |  |
| Anbefalt repo-oppdatering | source-shortlist / PCQ / claim-lock / casekort / ingen |

## Synteseprompt etter alle syv case

Kjør denne bare når alle validerte case-outputene foreligger.

```text
Du får syv validerte Deep Research-outputer for Food Systems Transition Group. Lag ikke ny research. Sammenstill beslutningsgrunnlag for videre sprint.

Oppgave:
1. Ranger casene etter validerbarhet de neste 7 dagene.
2. Ranger casene etter strategisk verdi hvis validert.
3. Skill mellom A-feed, B-sidestream og C-adoption.
4. Identifiser hvilke case som kan gi intern deck-slide nå, hvilke som krever primærkilde, hvilke som krever aktørvalidering, og hvilke som bør parkeres.
5. Lag en "do not say"-liste på tvers av alle case.
6. Lag en 7-dagers researchplan med dag, case, konkret dokumentask, stoppsignal og output.

Lever tabeller:

| Case | Strategisk verdi | Validerbarhet | Største blocker | Anbefalt status | Neste handling |
|---|---|---|---|---|---|

| Dag | Prioritet | Handling | Output | Stoppsignal |
|---|---|---|---|---|
```
