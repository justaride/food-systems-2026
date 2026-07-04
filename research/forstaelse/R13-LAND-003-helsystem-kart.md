---
id: R13-LAND-003
tittel: "Helsystem-kart og aktørtypologi — norsk matsystem"
dato: 2026-06-28
kontrollert: 2026-07-02
gate: forstaelse
importDecision: vent
regel: intern-syntese
---

## BRUKERVARSEL

**Dette dokumentet er et forståelse-dokument (arbeidskart), ikke en faktastemme.**

Alle noder er syntetisert fra R13-outputs (batch 01–11). Kildeklasse og gate er beholdt fra originalfilene og er ikke løftet til et høyere nivå gjennom syntesen. Ingen node i dette kartet er klar for ekstern publisering uten PCQ eller actor-gate-gjennomgang slik angitt per node. Overclaim-vakt gjelder: syntese er ikke bevis.

**Kontrollert:** 2026-07-02. Senere R13-kontroller overstyrer enkeltfakta i dette kartet; bruk filen som intern systemstruktur, ikke som siste faktakilde.

---

## Formål og scope

Dette kartet kobler R13-outputene fra aktørkartlegging (AKTOR), protein (PROT), innovasjon (INNO) og økologi (OKO) til et samlet systembilde. Formålet er intern orientering — å se hva vi vet, hva som henger sammen, og hvor vi ikke vet nok. Det er ikke en rapport og ikke et whitepaper.

Kildebase: R13-AKTOR-001–008, R13-PROT-006–007, R13-INNO-004–005, R13-OKO-001, R13-OKO-007. For noder der andre R13-filer (PROT-001–005, INNO-001–003, OKO-002–006, WASTE-006–008) er referert, er dette basert på kunnskap om at disse filene eksisterer i prosjektets corpus uten at de er lest i denne sesjonen; slike noder er markert med lavere evidensstyrke.

---

## Node 1 — Dominerende aktører

**Nodetype:** Markedsmaktkonsentrasjon — dagligvare og primærproduksjon

| Felt | Innhold |
|---|---|
| Nøkkelaktører | NorgesGruppen (Kiwi, Meny, Spar, Joker, Nærbutikken) — ~40 % av dagligvare; Coop (Extra, Prix, Mega, Obs, Marked) — ~27 %; REMA 1000 — ~24 %; Tine SA — ~94 % av råmelkmarkedet; Nortura SA — ~65 % av primærmarkedet rødt kjøtt/gris, ~45 % av foredling; Felleskjøpet Agri SA — dominerende i korn og kraftfôr |
| Evidensstyrke | B — Nordic Credit Rating-rapporter (NorgesGruppen jun. 2026; Nortura sep. 2025); OECD 2021 |
| R13-gate | source-shortlist (INNO-005) / PCQ (PROT-007) |
| Kobling til andre noder | → Node 3 (primærprodusenter: kooperativstruktur styrer priser og innkjøp); → Node 4 (distribusjon: ASKO er NorgesGruppens grossist-arm); → Node 5 (alternativt protein: markedsadgang krever sentralforhandling med disse aktørene); → Node 7 (innovasjonsaktører: skaleringsbarriere via kjedene) |
| Caveat | NorgesGruppens markedsandel: 40 % av dagligvare vs. 43 % av matvaresalg — to ulike metodar, ikke sammenlignbare direkte. Kooperativunntakene (Tine, Nortura, FK) er lovfestet, ikke markedssvikt i klassisk forstand. OECD (2021) observerte at unntaket "causes doubt about competition and innovation downstream" — dette er observasjon, ikke bevist kausal effekt. |

---

## Node 2 — Kooperativstruktur

**Nodetype:** Eierskap og kontroll — primærledd og grossistledd

| Felt | Innhold |
|---|---|
| Nøkkelaktører | Nortura SA (bønder som eiere; markedsbalanseringsmandat for kjøtt); Tine SA (bønder som eiere; markedsbalanseringsmandat for melk); Felleskjøpet Agri SA (bønder som eiere; korn og kraftfôr); Coop (forbrukereide; ikke primærledd-kooperativ) |
| Evidensstyrke | A — Lovtekst (kooperativunntaket i Konkurranseloven) bekreftet; OECD 2021 som sekundær analyse |
| R13-gate | source-shortlist (INNO-005) |
| Kobling til andre noder | → Node 1 (dominerende aktører: kooperativene er en del av dominansbildet); → Node 3 (primærprodusenter: bøndene er eiere men prisavtaler og kvotesystem binder dem); → Node 8 (regulatorisk: LMD og Landbruksdirektoratet setter jordbruksavtalen som rammer kooperativene) |
| Caveat | Aksjonærregister er ikke offentlig tilgjengelig (R13-AKTOR-006). Full eierkonsentrasjon innen kooperativene (hvem har størst innflytelse) er ikke kartlagt i denne runden. Springer (2022) finner ikke bevis for aktive lock-in-strategier fra norske incumbents — strukturell konsentrasjon og aktivt sabotasje er ulike fenomener. |

---

## Node 3 — Primærprodusenter

**Nodetype:** Produksjonsnivå — differensiert etter driftsform

| Felt | Innhold |
|---|---|
| Nøkkelaktører | **Konvensjonell:** ca. 37 000–40 000 aktive jordbruksbedrifter (SSB 2024, ikke hentet direkte her — referert fra systemkunnskap); **Øko-sertifiserte:** 1 872 gårdsbruk med øko-produksjon (SSB 2024, A-kilde via R13-OKO-001); **Regenerativ/agroøkologisk:** ikke tallfestet nasjonalt — epistemic gap; **Lokalmat/småskala:** 18 Brreg-verifiserte markedshager (navnsøk), anslagsvis mange flere under andre navn (R13-AKTOR-001, actor-gate); **Andelslandbruk:** Økologisk Norge oppgir 90 aktive per jan. 2026 (B-kilde), 21 Brreg-bekreftet (A-kilde) |
| Evidensstyrke | A for øko-tall (Debio/SSB); B for andelslandbruk-aggregat; C for regenerativ-segment |
| R13-gate | actor-gate (AKTOR-001, AKTOR-002); PCQ (OKO-001) |
| Kobling til andre noder | → Node 2 (kooperativer: konvensjonelle bønder i Nortura/Tine-system); → Node 4 (distribusjon: produsenter er startpunkt for alle distribusjonskanaler); → Node 6 (food waste: primærproduksjon genererer pre-consumer svinn som ikke er nasjonalt kartlagt); → Node 10 (bevegelsesaktører: øko- og andelslandbruk overlapper med bevegelsesaktørene) |
| Caveat | Ingen nasjonal offentlig database over markedshager. Ingen nasjonal telling over regenerative bønder. Øko-areal på 4,5 % av totalt jordbruksareal (2025, inkl. karens) — ikke av matproduksjon eller matforbruk. Antall gårdsbruk i øko-produksjon er i netto nedgang: –25 i 2024, –17 i 2025. |

---

## Node 4 — Distribusjon og logistikk

**Nodetype:** Vareflyt fra primærprodusent til sluttforbruker

| Felt | Innhold |
|---|---|
| Nøkkelaktører | **Kjedeintegrert:** ASKO (NorgesGruppen) — nasjonalt distribusjonsnettverk; COOP Distribusjon; REMA Distribusjon; **Spesialgrossist:** Godt Lokalt/Spesialgrossistene (DLVRY) — >1 mrd. kr omsetning 2025, 350+ produsenter, kjedenøytral; **Direktesalg samlet:** 938 mill. kr (2025, Reiler Consulting/Stiftelsen Norsk Mat — A-kilde); **REKO-ringer:** over 130 ringer per udatert forsidetekst (B-kilde, frosset ved feb. 2022-tall: 140+ ringer, 500 000+ kunder, 600+ produsenter); **Bondens marked:** ca. 20 steder i aktiv drift (2026), Oslo-laget 27 mill. kr omsetning rekord 2023; **Digitale plattformer (tidligfase):** Lokalmat.no (B2B-katalog, 650+ produsenter); Dyrket.no (Oslo-region, 100+ produsenter); Tastebuds (Bergen); Rekono (Oslo, pilot); LocalFood (digital REKO-supplement); **Food hubs:** Gudbrandsdalsmat SA (25+ produsenter, distribusjon via Tine) |
| Evidensstyrke | A for direktesalg-total (Reiler Consulting); A for Godt Lokalt-omsetning (fagpresse 2026); B for REKO-tall (frosset 2022); B for Bondens marked Oslo; B/C for digitale plattformer |
| R13-gate | source-shortlist (AKTOR-008, AKTOR-003) |
| Kobling til andre noder | → Node 1 (dominerende aktører: ASKO er NorgesGruppens arm — kjedenes distribusjon er ikke separerbar fra markedsmakten); → Node 3 (primærprodusenter: distribusjonskanalenes tilgjengelighet bestemmer hvilke produsenter som kan nå markedet); → Node 10 (bevegelsesaktører: REKO og Bondens marked er bevegelsesforankrede distribusjonsformer) |
| Caveat | Direktesalg-totalen (938 mill. kr) er ikke dekomponert per kanal i offentlig kilde — REKO, Bondens marked og gårdsutsalg er samlet. REKO-tall er frosset ved feb. 2022; organisasjonen REKO Norge ble stiftet jan. 2025 og hadde ikke publisert årsmelding per søksdato. Ikke si at REKO har 140 ringer i 2025. |

---

## Node 5 — Alternativt protein

**Nodetype:** Nye proteinkilder — pilot vs. realisert skala

| Felt | Innhold |
|---|---|
| Nøkkelaktører | **Insektprotein:** Invertapro AS (Brreg-verifisert, A-kilde rolledata; pilot/vekst); NorInsect AS + NorInsect Holding AS (konsern, 2015, Brreg A-kilde); Enorm Biofactory DK (konkurs okt. 2025, B-kilde); **Encelleprotein (SCP):** Solar Foods Oy (FI) — Factory 01 operasjonell 2024, 160 t/år kapasitet (B-kilde); Calysta — 20 000 t/år i Kina (C, norsk bruk ikke kvantifisert); **CEA/vertikal farming:** Avisomo AS (17 ansatte, Gjøvik); Onna Greens AS (50 ansatte, Moss); Vertical Agri AS (ingen ansatte, svak profil); Grønt fra Nord (rettsstyrt restrukturering feb. 2026, B-kilde); **Mycel:** Norwegian Mycelium AS (12 ansatte, FoU-stadium, A-kilde rolledata); **Plantebasert:** Vestkorn Milling AS (erteprot., Tau, 66 ansatte, Brreg A-kilde) |
| Evidensstyrke | A for Brreg-rolledata på norske aktører; B for teknologi/skalering-status; C for kommersiell volum |
| R13-gate | PCQ (AKTOR-006) |
| Kobling til andre noder | → Node 6 (food waste: SCP og insektprotein bruker organiske sidestrømmer som substrat); → Node 7 (innovasjonsaktører: alternativt protein er kjernen i innovasjonsporteføljen); → Node 9 (forskningsmiljøer: Nofima, NIBIO, NMBU er FoU-partnere) |
| Caveat | Aksjonærregister er ikke offentlig for noen av disse selskapene. Insektmel + SCP + alger utgjorde kun 0,4 % av norsk laksefôrvolum i 2020 (A-kilde, Nofima 2022) — siste offentlige tall. Volum 2023–2025 er ikke offentliggjort. Ikke si at insektmel/SCP erstatter soya i norsk fôr — dette er potensial/mål, ikke realisert. |

---

## Node 6 — Food waste-strømmer

**Nodetype:** Svinn og sidestrøm — etter verdikjedetrinn

| Felt | Innhold |
|---|---|
| Nøkkelaktører | **Husholdning:** –18 % fra 2015-nivå per Matvett 2025 (B-kilde); delmål –30 % innen 2025 ikke nådd for husholdninger; **Matbransje:** –31 % fra 2015 — delmål nådd (Matvett 2025, B-kilde); **Primærjordbruk:** ikke inkludert i nasjonal matsvinnkartlegging — strukturelt hull; **Marint restråstoff:** fangstnivå og restråstoffandel ikke kartlagt i dette oppdraget (jf. R13-WASTE-seriene, ikke lest her); **Sirkulære aktører:** Restaurant Rest AS (matsvinn-til-gourmet, konkurs sept. 2024, A-kilde Brreg); Gruten AS (kaffegrut-upcycling, ikke funnet i Brreg, C-kilde) |
| Evidensstyrke | A for policy-mål (Prop. 130 L 2025, Lovdata); B for Matvett-tall; C for primærjordbruksvinn og enkeltaktører |
| R13-gate | PCQ (OKO-007 for policy-mål); source-shortlist (AKTOR-006 for sirkulære aktører) |
| Kobling til andre noder | → Node 5 (alternativt protein: insektprotein og SCP er potensielle mottakere av matavfallsstrømmer); → Node 8 (regulatorisk: Matsvinnloven vedtatt 27.05.2025, ikrafttredelse ikke bestemt) |
| Caveat | Matsvinnloven (lov 2025-06-20-103) er vedtatt men ikke i kraft per søksdato — ikrafttredelse bestemmes av Kongen. Totalt –24 % fra 2015 er kartlagte sektorer; primærjordbruk er ekskludert. Ikke si at matsvinnmålet er nådd — det nasjonale halverings-målet (–50 % innen 2030) er ikke nådd. |

---

## Node 7 — Innovasjonsaktører

**Nodetype:** Agritech, CEA, alt-protein — oppstartere og FoU-spinoffs

| Felt | Innhold |
|---|---|
| Nøkkelaktører | **Aktive (tilsynelatende):** Avisomo AS, Onna Greens AS, Invertapro AS, NorInsect AS, Norwegian Mycelium AS, Vestkorn Milling AS, Solar Foods Oy (FI); **I restrukturering/uro:** Grønt fra Nord AS (rettsstyrt restr. feb. 2026); Nordic Harvest (DK — finansiell status ukjent, negativ egenkapital DKK –52M per 2024, B-kilde); Oatly (børsnotert, vedvarende tap, gjeldsrestrukturering sept. 2025); Beyond Meat (SEC-filing A-kilde, vedvarende tap); **Bekreftet konkurs/avviklet:** Plantagon (SE, 2019); Infarm (DE/NL, 2023); Mycorena (SE, 2024 — teknologi videreført av Naplasol/VEOS); Enorm Biofactory (DK, okt. 2025); Restaurant Rest AS (NO, sept. 2024) |
| Evidensstyrke | A for norske konkurs-/rolledata (Brreg); A for børsnoterte (SEC); B for nordiske konkursdata (bransjepress, primærregistre ikke direkte sjekket for SE/DK/DE) |
| R13-gate | source-shortlist (INNO-004, INNO-005) |
| Kobling til andre noder | → Node 5 (alternativt protein: overlapper fullt); → Node 8 (regulatorisk: Novel Food-forordningen, Innovasjon Norge tomme potter i 9 av 15 regioner per mid-2026); → Node 9 (forskningsmiljøer: FoU-partnerskap er skaleringsveien for mange) |
| Caveat | 5 av 9 kartlagte aktører i R13-INNO-004-ledgeren er bekreftet konkurs/avviklet siden 2019. Failure-mønster: kapitalintensitet + investortørke fra 2022 + energipriser + prematur skalering — ikke teknologisvikt alene. Ikke si "altprotein-sektoren har feilet" — bildet er blandet. Ikke si at konkurs beviser at teknologien ikke fungerer. |

---

## Node 8 — Regulatorisk og policy

**Nodetype:** Statlig rammesetting — myndigheter, tilsyn, lovverk

| Felt | Innhold |
|---|---|
| Nøkkelaktører | **LMD** (Landbruks- og matdepartementet) — jordbruksavtalen, nasjonal øko-strategi, matsvinn; **Landbruksdirektoratet** — kraftfôrstatistikk, produksjonstilskudd, markedsregulering; **Debio** — sertifisering av øko-produksjon (3 018 godkjente virksomheter 2025, A-kilde); **Mattilsynet** — Novel Food, plantevernmidler; **Riksrevisjonen** — uavhengig kontroll (konkluderte jun. 2025: klimamålet for jordbruket nås sannsynligvis ikke); **KOFA** (Klagenemnda for offentlige anskaffelser) — relevant for offentlig matinnkjøp; **Innovasjon Norge** — landbruksmidler oppbrukt i 9 av 15 regioner per mid-2026 |
| Evidensstyrke | A — Stortingsvedtak, Riksrevisjonen, Lovdata, Landbruksdirektoratets statistikk |
| R13-gate | PCQ (OKO-007) |
| Kobling til andre noder | → Node 2 (kooperativer: LMD setter jordbruksavtalen som kooperativene opererer under); → Node 3 (primærprodusenter: tilskuddssystem favoriserer konvensjonell produksjon); → Node 5 (alt. protein: Novel Food-godkjenning er 2,5+ år i gjennomsnitt, EPIC-SHIFT 2026) |
| Caveat | EU Farm to Fork er IKKE EØS-innlemmet som helhet — Norge er ikke bundet av F2F-strategien, men påvirkes av enkeltdirektiver via EØS. Ikke si "Norge har forpliktet seg til EU Farm to Fork." Klimamålet for jordbruket (5 mill. tonn CO2-ekv. 2021–2030) er ikke i rute — kun 0,063 mill. tonn redusert i 2021 (første år). Matsvinnloven vedtatt men ikke i kraft. |

---

## Node 9 — Forskningsmiljøer

**Nodetype:** Kunnskapsproduksjon og evidensbase

| Felt | Innhold |
|---|---|
| Nøkkelaktører | **NIBIO** (Norsk institutt for bioøkonomi) — selvforsyningsgrad, jordbruksstatistikk, klimastatus; **Nofima** — laksefôr ressursregnskap (2020 siste offentlige), fiskeernæring; **NMBU** (Norges miljø- og biovitenskapelige universitet) — Foods of Norway-spinoffs, agroøkologi; **Ruralis** — MatMakt-prosjektet, agroøkologisk metrikk, BRLa-kalkulator; **HI** (Havforskningsinstituttet) — blåskjell/fiskefôr-forskning; **Matsystemutvalget** — NOU leveres innen 1. november 2026, to bakgrunnsrapporter overlevert mars 2026 (Ruralis/NIBIO scenarioanalyse + Menon Economics) |
| Evidensstyrke | A for institusjonell eksistens og primærpublikasjoner; B for enkeltfunn referert via sekundærkilder |
| R13-gate | source-shortlist (INNO-005 refererer disse) |
| Kobling til andre noder | → Node 5 (alt. protein: Nofima/NMBU er FoU-partnere for insektprotein, SCP); → Node 3 (primærprodusenter: NIBIO leverer selvforsyningsgraden som premiss for politikk); → Node 8 (regulatorisk: Riksrevisjonen bruker NIBIO-data; Matsystemutvalget er statlig bestilt) |
| Caveat | Nofima ressursregnskap for fôrråvarer 2020 er siste offentlige — ingen nyere er funnet. Matsystemutvalgets NOU er ikke levert per juni 2026; ikke si at utvalget har konkludert. NIBIO-metoden for selvforsyningsgrad korrigerer kun for kraftfôr til husdyr, ikke for fiskefôr. |

---

## Node 10 — Bevegelsesaktører

**Nodetype:** Grasrot, nettverk og alternativ matpolitikk

| Felt | Innhold |
|---|---|
| Nøkkelaktører | **REKO-ringer:** >130 ringer (udatert forsidetekst, B-kilde), stiftet som selvstendig org. jan. 2025 (REKO Norge, Brreg A-kilde); **Andelslandbruk:** 90 aktive per Øk.Norge jan. 2026 (B-kilde aktørrapportert), 21 Brreg-bekreftet (A); **Markedshager:** Småskala Grønt Norge (FLI, stiftet mars 2026, ingen nettside, ingen publisert medlemsliste); Markedshager Vestland (FLI, stiftet mai 2025); **Frønettverk:** eksisterer i corpus (R13-AKTOR-005, ikke lest her); **Bondens marked:** stiftelse, ca. 20 steder (A-kilde) |
| Evidensstyrke | A for Brreg-registreringsdata; B for aggregattall (Øk.Norge, REKO Norge) |
| R13-gate | actor-gate (AKTOR-001, AKTOR-002, AKTOR-003) |
| Kobling til andre noder | → Node 3 (primærprodusenter: bevegelsesaktørene er primærprodusenter i alternativ distribusjon); → Node 4 (distribusjon: REKO og Bondens marked er kanalene for bevegelsesaktørene) |
| Caveat | REKO-tall er frosset ved feb. 2022. Ingen offentlig per-gård-status for ~65 gårder av 90 andelslandbruk (Økoguiden krever JavaScript). Ikke si at "det er X antall markedshager i Norge" — Brreg-søk gir minimum 18, men mange drives under andre firmanavn. |

---

## Systemspanning-seksjoner

### Dominansanalyse

Det norske matsystemet er strukturelt konsentrert i to overlappende aksler:

**Akse 1 — Retailkonsentrasjon:** Tre kjedegrupperinger (NorgesGruppen, Coop, REMA) kontrollerer ~91 % av dagligvareomsetningen. NorgesGruppen alene har ~40 % markedsandel og vertikal integrasjon nedover i distribusjon (ASKO), foredling (Unil, Bakehuset) og eiendom (kjedebygg). Innkjøpsmakt er konsentrert: 10 største leverandører utgjør ~50 % av innkjøp.

**Akse 2 — Primærledd-kooperativer:** Tine (94 % råmelk), Nortura (~65 % rødt kjøtt/gris), Felleskjøpet (korn/kraftfôr) har lovfestede markedsbalanseringsmandat og unntak fra Konkurranseloven. OECD (2021) observerer at dette "causes doubt about competition and innovation downstream."

**Kombinasjonseffekt:** Ny aktør som vil skalere i norsk mat møter primærledd-kooperativer på innkjøpssiden og kjedekonsentrasjon på salgssiden. Dette er ikke ulovlig, men det er strukturelt krevende.

**Evidensstyrke for dominansanalysen:** B — basert på Nordic Credit Rating (B-kilde) + OECD 2021 (A-kilde for observasjon, ikke for kausal effektestimering). Springer (2022): finner ikke bevis for aktive lock-in-strategier.

---

### Gap-analyse

**Strukturelle datagap som begrenser kartet:**

| Gap | Type | Kildeklasse |
|---|---|---|
| Protein-spesifikk selvforsyningsgrad (gram protein per capita) | Metodisk hull — ikke beregnet offisielt | C |
| Fôrkorrigert selvforsyning inkl. fiskefôr | Metodisk hull — aquakultur ekskludert fra offisiell korreksjon | C |
| Matsvinn fra primærjordbruk | Strukturelt ekskludert fra nasjonal kartlegging | C |
| Økoguiden per-gård aktiv status | JavaScript-krav hindrer maskinlesing | C |
| REKO-statistikk etter feb. 2022 | Ingen oppdatert primærkilde publisert | C |
| Aksjonærstruktur for alle kartlagte innovasjonsaktører | Aksjonærregister ikke offentlig | C |
| Nofima ressursregnskap fôrråvarer 2021–2025 | Ikke publisert | C |
| Nasjonal telling over markedshager | Eksisterer ikke som offentlig register | C |
| Regenerativ/agroøkologisk produksjon — nasjonal volum | Ingen offisiell kategori i statistikk | C |
| Offentlig matinnkjøp av øko — kvantifisert mål | Ikke vedtatt som tallfestet mål | C |

---

### Motmakt-analyse

Følgende aktørkategorier representerer potensielle motmaktstrukturer mot systemkonsentrasjonen:

- **REKO-ringer** (over 130 ringer, direktesalg utenfor kjedesystemet)
- **Andelslandbruk** (90 gårder, ~10 000 andelshavere — aktørrapportert B-kilde)
- **Godt Lokalt/Spesialgrossistene** (kjedenøytral grossist, >1 mrd. kr omsetning 2025)
- **Småskala Grønt Norge** (ny nasjonal stemme for småskala grøntprodusenter, stiftet 2026)
- **Matsystemutvalget** (NOU nov. 2026 — potensielt politisk motmakt)

**Begrensning av motmaktanalysen:** Samlet markedsandel for alle direktesalgskanaler er 938 mill. kr (2025) mot dagligvare på 6,45 mrd. kr. Direktesalg utgjør anslagsvis 10–12 % av matmarkedet der det er tilstedeværende — men total matmarkedsstørrelse avhenger av definisjon (lokalmat/drikke 13,55 mrd. kr totalt vs. total dagligvareomsetning på et høyere nivå). Direkte sammenligning er metodisk krevende.

---

### Innovasjonstetthet

Norsk matinnovasjonsøkosystem er karakterisert av:

1. **Høy FoU-aktivitet, lav kommersialiseringsrate:** NMBU/Nofima/NIBIO-miljøene er sterke forskningsinstitusjoner, men norsk TTO-track record for matinnovasjon er ikke systematisk evaluert. Ruralis BRLa-kalkulator (2022) peker på at TRL alene er utilstrekkelig — BRL (markedsklarhet, juridisk avklaring, org. kapasitet) er svakere for mange norske FoU-spinoffs.

2. **CEA-sektoren er i høyrisikofase:** Grønt fra Nord (NO) i restrukturering feb. 2026 etter biologiske tap + finansieringssvikt. Nordic Harvest (DK) har negativ egenkapital. 80 Acres Farms (US) overlever i premium-nisje — norsk rimelig vannkraft kan gi fordel for energiintensiv CEA, men forutsetter langsiktige kraftavtaler.

3. **Alt-protein er i mål/plan-fase, ikke realisert skala:** Insektmel + SCP + alger = 0,4 % av laksefôrvolum (2020). Mål: 25 % norskproduserte proteiner i fôr innen 2034 (Forskningsrådet 2023, B-kilde).

4. **Innovasjon Norge-potter tømt:** 9 av 15 regioner hadde tomme landbruksmidler per mid-2026 — direkte kapasitetsbegrensning for småskala matinnovasjon.

---

## Tomme celler / blinde flekker i kartet

Følgende celler er eksplisitt tomme og representer epistemiske hull — ikke valg om å utelate:

| Blind flekk | Forklaring |
|---|---|
| Waste-nodene (R13-WASTE-serien) er ikke lest | R13-WASTE-006 og R13-WASTE-008 eksisterer i corpus men er ikke lest i denne synteserunden — marint restråstoff og urban svinnprofil er ikke representert med primærdetalj |
| Frønettverk (R13-AKTOR-005) | Node 10 nevner frønettverk men filen er ikke lest — innhold er ukjent utover filens eksistens |
| AKTOR-004 (regenerative og agroøkologiske praktikere) | Ikke lest — regenerativ node er et hull i kartet |
| AKTOR-007 (skogshage og permakultur) | Ikke lest |
| INNO-001–003, INNO-006–007 | Ikke lest i denne sesjonen — CEA, agritech-økosy stem, finansiering, FoU-aktører og offentlig innovasjonsetterspørsel er representert kun via R13-INNO-004 og INNO-005 |
| OKO-002–006 | Ikke lest — agroøkologisk metrikk, jordhelse, biodiversitet, sertifisering og beite er ikke representert med primærdetalj |
| PROT-001–005, PROT-008 | Ikke lest — insektprotein-ledger, SCP, musling/tang/tare, plantebasert human protein, presisjonsfermentering og bønner/erter mangler primærdetalj i dette kartet |
| R13-LAND-001 og LAND-002 | Ikke lest — makt/eierkonsentrasjon og vertikal integrasjon ville ha styrket Node 1 og Node 2 vesentlig |
| Matvinn — husholdningsnivå per produktgruppe | R13-OKO-007 og systemkunnskap brukt, men svinntall per produktgruppe ikke kartlagt |
| Importandel av øko-omsetning | Strukturelt hull: tollregisteret skiller ikke systematisk øko fra konvensjonell |

---

## Ikke si

Dette kartet er ikke grunnlag for følgende påstander:

1. Ikke si at "det norske matsystemet er X % selvforsynt" uten å spesifisere metode (rå vs. fôrkorrigert), år og hva som er inkludert (fisk/sjømat eller ikke).
2. Ikke si at "90 aktive andelslandbruk" er et fakta-tall — det er Øk.Norges aktørrapporterte tall per jan. 2026, ikke uavhengig verifisert per gård.
3. Ikke si at REKO har 140 ringer i 2025 — tallet er frosset ved feb. 2022; forsidetekst sier "over 130" uten dato.
4. Ikke si at "konkursene i CEA og alt-protein beviser at teknologien ikke fungerer" — kapitaltørke og markedstiming er de dokumenterte primærårsak ene.
5. Ikke si at "insektmel/SCP erstatter soya i norsk fôr" — andelen var 0,4 % i 2020 og er i kommersiell oppstart i 2025.
6. Ikke si at norske kooperativer aktivt blokkerer innovasjon — strukturell konsentrasjon og aktivt sabotasje er ulike fenomener (Springer 2022).
7. Ikke si at "Norge har forpliktet seg til EU Farm to Fork" — F2F er ikke EØS-innlemmet som helhet.
8. Ikke si at klimamålet for jordbruket er i rute — Riksrevisjonen konkluderte motsatt i juni 2025.
9. Ikke si at matsvinnmålet er nådd — bransjen nådde delmålet, men det nasjonale halverings målet (–50 % innen 2030) er ikke nådd; Matsvinnloven er ikke i kraft.
10. Ikke si at "4,5 % av matproduksjonen er økologisk" — korrekt er 4,5 % av jordbruksarealet (inkl. karens, 2025).
11. Ikke si at eierskap i noen av de kartlagte innovasjonsselskapene er kjent — aksjonærregister er ikke offentlig.
12. Ikke si at Matsystemutvalget har konkludert om protein, matsystem eller klima — NOU leveres innen 1. november 2026.
13. Ikke bruk dette kartet som faktastemme — det er en intern arbeidsflate.

---

## Anbefalt gate

**forstaelse** — Dette dokumentet er og forblir et forståelsesdokument/arbeidskart. Ingen node er løftet til et høyere evidensnivå gjennom syntesen. For ekstern bruk av enkeltpåstander gjelder gatene fra originalfilene:

- **PCQ** (Prioritert Claim Qualification): Node 3 (øko-tall), Node 5 (alt. protein), Node 6 (food waste/policy), Node 8 (regulatorisk), Node 9 (selvforsyning/NIBIO)
- **actor-gate**: Node 3 (markedshager, andelslandbruk), Node 10 (bevegelsesaktører)
- **source-shortlist**: Node 4 (distribusjon/REKO/Bondens marked), Node 7 (innovasjons-failure-ledger)

Neste steg for å styrke kartet: lese R13-LAND-001 og LAND-002 (makt/eierkonsentrasjon og vertikal integrasjon), R13-AKTOR-004 (regenerative praktikere), R13-WASTE-serien, og INNO-001–003.

## Kontroll 2026-07-02

Kartet er kontrollert som intern syntese. Flere av blindflekkene som var korrekte 2026-06-28 er senere kontrollert i egne R13-filer, blant annet R13-LAND-001/002/005, R13-WASTE-001/003/004/005/006/007/008, R13-INNO-001/002/003/004/005/006/007, R13-OKO-002/003/004/005/006/007 og R13-PROT-001/002/003/004/005/006/007/008. Det gjør ikke denne filen claimbar; det gjør den til et eldre systemkart som må leses sammen med nyere kontrollerte artefakter.

Bruksregel etter kontroll: ikke bruk tall, aktørlister eller statuslinjer her som ekstern kilde uten å gå til det nyeste kontrollerte underlagsdokumentet for den konkrete noden.

---

---DECISION-JSONL---
{"id":"R13-LAND-003","decision":"enrich","valueTier":"high","title":"Helsystem-kart og aktørtypologi — norsk matsystem","canonicalPath":"research/forstaelse/R13-LAND-003-helsystem-kart.md","shortVerdict":"Ti-node systemkart koblet fra R13 batch 01–11: aktørkart, protein, innovasjon og økologi syntetisert til ett landskap med bevart gate per node. Sterkeste bidrag: dominans- og kooperativanalysene (Node 1–2) og innovasjons-failure-mønsteret (Node 7). Svakeste punkt: waste-nodene, regenerativ-segmentet og LAND-001/002 ikke lest i denne sesjonen — tre store blinde flekker gjenstår.","strongestSource":"R13-syntese batch 01–11; sterkeste enkeltkilder: Riksrevisjonen Dok. 3:13 (2024–2025, A); Brreg Enhetsregisteret API (A); Landbruksdirektoratets kraftfôrstatistikk 2025 (A); Reiler Consulting/Stiftelsen Norsk Mat Lokalmatrapport 2025 (A)","weakestPoint":"R13-WASTE-serien, R13-AKTOR-004–005/007, R13-OKO-002–006, og R13-LAND-001/002 ikke lest — marint restråstoff, regenerativ produksjon, jordhelse, biodiversitet og fullstendig makt/vertikal-integrasjon er ikke representert med primærdetalj i kartet","sourceClass":"syntetisk — behold gate per node fra originalfiler","gapType":"Tre kategorier blinde flekker: (1) waste-strømmer ikke representert; (2) regenerativ/agroøkologisk-segmentet er C-hull; (3) R13-LAND-001/002 ikke lest — kartet mangler den fullstendige makt- og integrasjonsanalysen som de to filene inneholder","gate":"forstaelse","importDecision":"vent","ikkeSi":["Norge er X % selvforsynt med protein (metodeavhengig; ikke offisiell serie for protein-spesifikk selvforsyning)","90 aktive andelslandbruk er et faktumtall (aktørrapportert B-kilde)","REKO har 140 ringer i 2025 (frosset 2022-tall)","Konkursene i CEA/alt-protein beviser at teknologien ikke fungerer","Insektmel/SCP erstatter soya i norsk fôr (0,4 % av volum i 2020 — plan/potensial, ikke realisert)","Norske kooperativer aktivt blokkerer innovasjon (strukturell konsentrasjon ≠ aktivt sabotasje)","Norge har forpliktet seg til EU Farm to Fork (F2F ikke EØS-innlemmet som helhet)","Klimamålet for jordbruket er i rute (Riksrevisjonen konkluderte motsatt jun. 2025)","Matsvinnmålet er nådd (bransjedelmål nådd, nasjonalt halvering smål ikke nådd, Matsvinnloven ikke i kraft)","4,5 % av matproduksjonen er økologisk (korrekt: 4,5 % av jordbruksarealet inkl. karens, 2025)","Eierskap i innovasjonsselskapene er kjent (aksjonærregister ikke offentlig)","Matsystemutvalget har konkludert (NOU leveres nov. 2026)","Dette kartet er en faktastemme (det er et forståelsesdokument/arbeidskart)"],"fetchedSources":[],"fileEdited":true}
