# Prosjektgjennomgang: Food Systems 2026

**Dato:** 17. mars 2026  
**Formål:** Lage en beslutningsklar oversikt over hva prosjektet forsøker å kartlegge, hvilket underlag som allerede finnes i repoet, og hvilke kunnskapshull som fortsatt må tettes.  
**Status:** Kanonisk arbeidsnotat for videre research- og promptarbeid.

---

## 1. Hva prosjektet er

`Food Systems 2026` er et nordisk forprosjekt for **Food Systems Transition Group** under Nordic Circular Hotspot / Natural State. Prosjektet skal levere et **whitepaper / innsiktsrapport innen juni 2026**, og samtidig bygge grunnlaget for en sterkere nordisk concept note, partnerkoalisjon og senere finansiering.

Prosjektet forsøker ikke bare å beskrive matsystemet generelt. Det forsøker å kartlegge:

1. **maktstrukturer og markedskonsentrasjon** i dagligvare og verdikjede
2. **beredskap, selvforsyning og importavhengighet**
3. **verdikjedens infrastruktur** fra innsatsvarer til forbruk, matsvinn og sirkularitet
4. **nordiske forskjeller** i marked, regulering og institusjonelle modeller
5. **aktører, konfliktlinjer og mulige transformasjonsspor**
6. **grunnlag for pilotspor, policyspor og videre søknadsarbeid**

Den operative rammen er `Ten Step Start v2.0`, der prosjektet skal ende i en kombinasjon av innsikt, aktørmobilisering, pilotforslag og roadmap.

---

## 2. Hva som faktisk finnes i repoet i dag

Dette repoet er allerede mer enn et notatarkiv. Det består av fem lag som henger sammen:

| Lag | Innhold | Status |
|---|---|---|
| Prosjektmandat | Søknader, møtenotater, transition group-metodikk, oppdragsbeskrivelser | Sterkt |
| Forskningskorpus | `research/` med bibliotek, analyser, nordiske sammenligninger, kilderegistre | Sterkt |
| Datasett | Strukturerte JSON/CSV/GeoJSON i `public/data/food-systems/` og `research/data/` | Sterkt |
| Plattform | Next.js + TypeScript + PostgreSQL/Prisma, bibliotekssider, kart, søk, API-er | Sterkt |
| Promptinfrastruktur | 39 eksisterende research-prompts i 12 kategorier | Delvis moden |

### 2.1 Dokumenterte volum i repoet

Tallene under er basert på dagens repo-struktur:

- `research/bibliotek/`: **95** markdown-dokumenter
- `research/norden/`: **23** markdown-dokumenter
- `research/norge/`: **9** markdown-dokumenter
- `research/rammeverk/`: **21** markdown-dokumenter
- `src/lib/data/sources.ts`: **100** registrerte `SourceDoc`-oppføringer
- `src/lib/data/theses.ts`: **31** registrerte master-/avhandlingsoppføringer
- `src/lib/data/research-prompts.ts`: **39** prompts fordelt på **12** kategorier

### 2.2 Kjernedokumenter som definerer retningen

De viktigste styrings- og kontekstdokumentene er:

- `PROJECT-OVERVIEW.md`
- `research/README.md`
- `research/RESEARCH-MISSIONS.md`
- `research/RESEARCH-EXECUTION-PLAN.md`
- `research/VERDIKJEDE-KARTLEGGING-PLAN.md`
- `research/whitepaper/gap-list.md`
- `research/analyse/meeting-4-research-focus.md`
- `research/norden/nordisk-offentlig-kildemappe.md`
- `research/norden/nordic-source-registry-notes.md`

Disse dokumentene er samstemte på ett hovedpoeng: prosjektet har allerede mye materiale, men mangler et samlet grep om **dekning vs. gap**.

---

## 3. Eksisterende underlag: hva slags materiale vi faktisk har

### 3.1 Mandat, metode og prosjektstyring

Repoet har allerede god dekning av:

- prosjektbakgrunn fra tidligere og nåværende søknader
- transition group-metodikk og arbeidslogikk
- oppdragsbeskrivelser fra mars 2026
- mission-dokumenter som beskriver menneskelige avhengigheter, intervjuer og valideringsbehov
- whitepaper-gapliste koblet til Evidence Pack

Dette betyr at prosjektets **formål** og **forventede leveranser** er godt avklart. Det som mangler her er ikke mer intern kontekst, men koblingen mellom denne konteksten og videre kildeinnhenting.

### 3.2 Norsk analysegrunnlag

Det norske sporet er allerede tungt dokumentert i:

- `research/norge/markedskonsentrasjon.md`
- `research/norge/pristransmisjon.md`
- `research/norge/forsyningskjede.md`
- `research/norge/regulatorisk-landskap.md`
- `research/norge/matsikkerhet-beredskap.md`
- `research/norge/nordstad-tesen.md`
- `research/norge/nordstad-oppdatering.md`

Dette dekker i praksis:

- HHI / CR3 / konsentrasjonslogikk
- prisutvikling og PPI/KPI-spennet
- grossist- og distribusjonsmakt
- norsk regulatorikk
- beredskap og selvforsyning

Norge er derfor prosjektets sterkest dekkede case.

### 3.3 Nordisk sammenligningsgrunnlag

Nordisk nivå er også godt utviklet:

- `research/norden/nordisk-markedsstruktur-data-2026.md`
- `research/norden/nordisk-selvforsyning-beredskap-2026.md`
- `research/norden/regulatory-policy-landscape-nordic.md`
- `research/norden/nordisk-offentlig-kildemappe.md`
- `research/norden/nordic-source-registry.csv`
- `research/norden/verdikjede/01-10`

Dette gir et første nordisk basislag for:

- markedsstruktur
- prisnivå og inflasjon
- selvforsyning og beredskap
- regulatoriske forskjeller
- verdikjedeledd på tvers av fem land

Det nordiske sporet er derfor **bredt**, men ikke like godt **validert** eller **fullført** som det norske.

### 3.4 Strukturerte data og geodata

Prosjektet har allerede lokale datasett som kan brukes direkte i analyser og visualiseringer:

- butikkpunkter
- kommunegrenser og kommunedata
- logistikk-knutepunkter
- havner
- akvakulturlokaliteter
- landbruks- og handelsdata
- finansielle nøkkeltall
- ferdigberegnede chart-metrics

Dette ligger særlig i:

- `public/data/food-systems/`
- `public/data/food-systems/no/`
- `research/data/nordic/`

Viktig begrensning: deler av geodataene er kuraterte eller syntetiske demonstrasjonsdata, ikke fullt ut komplette produksjonsdatasett.

### 3.5 Bibliotek og sekundærkilder

Forskningsbiblioteket er allerede stort og variert, med materiale fra:

- NOU-er og stortingsdokumenter
- konkurransemyndigheter og dagligvaretilsyn
- akademia, NHH FOOD, SIFO, NMBU
- masteroppgaver
- årsrapporter og bransjekilder
- nordiske konkurranseorganer
- tenketanker og NGO-er
- matsvinn- og sirkularitetsmateriale

Dette betyr at prosjektet allerede har et godt bibliotek for å skrive, sitere og triangulere. Det som mangler er i større grad:

- systematisk dekning av **PhD-er og nordiske avhandlinger**
- tydeligere **deduplisering**
- mer komplett **mapping mot spesifikke forskningsspørsmål**

### 3.6 Promptinfrastruktur

Det finnes allerede 39 prompts i 12 kategorier, blant annet for:

- bøker og akademia
- forskningsartikler
- offentlige rapporter
- regulatorikk
- nordisk komparativ analyse
- matsikkerhet
- matsvinn / sirkularitet
- logistikk / verdikjede
- interessenter
- finansiering
- mediedebatt

Dette er et godt startpunkt, men promptbiblioteket er foreløpig mer et **idékatalogsystem** enn en operativ, prioritert Perplexity-backlog.

---

## 4. Dekningsmatrise: hva som er godt dekket, delvis dekket eller svakt dekket

| Tema | Dekning | Hva vi har | Hva som fortsatt mangler |
|---|---|---|---|
| Prosjektmandat og metode | God | Søknader, prosjektoversikt, Ten Step Start, møtenotater | Lite; mest behov for konsolidering |
| Norsk markedsstruktur og prisdynamikk | God | HHI, CR3, pristransmisjon, grossistmakt, regulatorikk | Flere oppdaterte kilder og tidsserier kan styrke bevisføringen |
| Nordisk markedsstruktur | God | Nordisk komparativ analyse, regulatorisk kartlegging, pris- og beredskapsspor | Partnerverifisering og siste 2025/2026-oppdateringer |
| Selvforsyning og beredskap | God | NIBIO, Riksrevisjonen, nordiske sammenligninger | Bedre metodisk sammenlikning mellom land, flere sektorspesifikke reservemodeller |
| Nordisk verdikjede-bredde | God | 8 verdikjedeledd kartlagt i egne dokumenter | Validering, oppdateringer og høyere detaljgrad i flere land |
| Offentlige og åpne kilder | God | Nordisk offentlig kildemappe, source registry, source scouting | Flere konkrete dokumenttrekk og tabellnivåreferanser |
| Forskningsbibliotek / sekundærkilder | God | 77 bibliotekdokumenter, kilderegister, kildetyper på tvers av sektorer | Deduplisering og tydelig kobling til prosjektets hovedspørsmål |
| Masteroppgaver og avhandlinger | Delvis | 15 registrerte oppgaver, flere NHH-arbeider, noen nordiske referanser | Systematisk jakt på norske PhD-er og nordiske master-/PhD-oppgaver |
| Aktørkart og commitment map | Delvis | Aktørkartutkast, innsikter om store aktører og familiedynastier | Full nordisk aktørdatabase, rolleklassifisering og konkret "ask" per aktør |
| Food desert / lokal konsentrasjon | Delvis | Butikkdata, kartkomponenter, eksisterende konsept og analyseramme | Kommunevis HHI, demografisk overlay, nordiske sammenligningsstudier |
| HORECA og offentlig innkjøp | Delvis | Egen verdikjedefil, enkelte case som København og skolemat | Systematisk kartlegging av grossister, offentlige kontrakter og storkjøkken |
| Sirkularitet som TG-definisjon | Delvis | Sterkt materiale om matsvinn, biogass, cascading og bioøkonomi | Operativ definisjon av hva som er "sirkulært" i akkurat dette prosjektet |
| Matsvinn og sirkulær praksis | Delvis til god | Eget dypdokument, nordisk verdikjedespor | Bedre sammenliknbarhet mellom lands målemetoder og styringsgrep |
| Eiendomsmodell / internleie / lease-back | Svak | Et factsheet om eiendomsmakt og noen møtehypoteser | Kvantifisering, selskapsstruktur, nordisk sammenligning og kobling til pris |
| Leverandørfrykt / handelspraksis / enforcement gap | Svak til delvis | Dagligvaretilsyn, lov om god handelsskikk, policyspor | Flere konkrete case, leverandørstemmer, sammenlignende dokumentasjon |
| Seafood feed / globale avhengigheter | Svak til delvis | Sjømatverdikjede, noen innsikter om fôr og ingredienser | Vest-Afrika-sporet, råvareopprinnelse, konflikt med global matsikkerhet |
| Intervju- og fortellerstoff | Svak | Mission-dokumenter og foreslåtte intervjuer | Faktiske sitater, verifiserte stemmer, kvalitative caser |
| Pilotspor / adoption / finance note | Svak | Overordnede ideer og noen mulige pilotretninger | Konkretisering, benchmark-case, finansieringskart og virkemiddellogikk |

---

## 5. Hovedkonklusjoner fra gjennomgangen

### 5.1 Prosjektet mangler ikke materiale. Det mangler styrt utfylling.

Det viktigste funnet er at prosjektet allerede har betydelig dybde. Videre research bør derfor ikke være generell "bakgrunnslesing", men målrettet innhenting av:

- **bevis som mangler for å lukke et kjent gap**
- **nyere eller bedre kilder som gjør et eksisterende argument mer robust**
- **kilder som åpner nye transformasjonsspor der repoet fortsatt er svakt**

### 5.2 Perplexity bør brukes på tre ulike måter

Videre søk bør deles i tre typer:

1. **valideringssøk**  
   Bekrefte markedsandeler, vedtak, rapporter, siste oppdateringer, nordiske tall

2. **bibliografisøk**  
   Finne masteroppgaver, PhD-er, artikler, rapportserier, working papers, think tank-materiale

3. **gap-søk**  
   Søke på svakt dokumenterte spor som eiendomsmodell, food deserts, offentlig innkjøp, sirkularitetsdefinisjon, laksefôr og globale avhengigheter

### 5.3 Ikke alle eksisterende "masterlister" i repoet er relevante for dette arbeidet

`research/rammeverk/forskningsmasterliste.md` og `research/rammeverk/forskningsmasterliste-v1.md` følger et bredere, idéhistorisk og systemteoretisk spor. De er nyttige som intellektuell bakgrunn, men skal **ikke** være kanoniske kilder for den operative Perplexity-backloggen til `Food Systems 2026`.

Den operative masterlisten må i stedet knyttes til:

- de reelle prosjekthullene
- ønsket lagringsstruktur i repoet
- konkrete outputtyper som kan brukes videre i whitepaper, Evidence Pack og nordisk kartlegging

---

## 6. Prioriterte kunnskapshull som den nye promptmasterlisten må dekke

Følgende hull er mest viktige å dekke først:

1. **Nordisk validering av markedsstruktur, regulatorikk og oppdaterte 2025/2026-data**
2. **Systematisk innhenting av masteroppgaver og PhD-er i Norge og Norden**
3. **Aktørkartlegging med roller, interesser og kobling til Commitment Map**
4. **HORECA, storkjøkken og offentlig innkjøp**
5. **Food deserts, lokal konsentrasjon og butikktetthet**
6. **Eiendomsmodell, internleie og kapitalstruktur i dagligvare**
7. **Leverandørperspektivet og enforcement gap**
8. **Sjømatfôr, råvareopprinnelse og globale avhengigheter**
9. **Operativ definisjon av sirkularitet i nordiske matsystemer**
10. **Pilot-, finansierings- og benchmark-spor**

---

## 7. Foreslått lagringslogikk for nye researchfunn

Perplexity-funn bør ikke dumpes vilkårlig i repoet. De bør lagres etter type:

| Funn-type | Primær lagringsplass |
|---|---|
| Norske og nordiske masteroppgaver / PhD-er | `research/bibliotek/akademia/` |
| Offentlige og regulatoriske dokumenter | `research/bibliotek/offentlig/` eller `research/bibliotek/nordisk-konkurranse/` |
| Bransje- og årsrapporter | `research/bibliotek/bransje/` |
| Tematiske synteser på tvers av land | `research/norden/` eller `research/norge/` |
| Aktør- og nettverkskartlegging | `research/interviews/` |
| Whitepaper-nære gapnotater | `research/evidence-pack/` eller `research/whitepaper/` |
| Styrings- og metodegrep | `research/rammeverk/` |

Default-regel:

- **rå funn** og kildeoppsummeringer lagres i `research/bibliotek/...`
- **synteser** lagres i `research/norden/`, `research/norge/` eller `research/evidence-pack/`

---

## 8. Hva den nye Perplexity-masterlisten skal gjøre

Den nye masterlisten skal være:

- **operativ**, ikke bare inspirerende
- **prioritert**, ikke bare komplett
- **repo-kompatibel**, med foreslått lagringsplass per prompt
- **de-duplisert** mot dagens 39 prompts
- **Perplexity-optimalisert**, med tydelig kildeprioritering og ønsket output

Listen skal derfor bygge videre på det som allerede finnes, men skifte fokus fra:

- katalog av idéer  
til
- kjørbar forskningslogg for de neste research-rundene

---

## 9. Arbeidsregel for videre research

Videre søk skal som hovedregel:

1. prioritere **offentlige og primære kilder** før sekundærkilder
2. hente **fulltekst eller stabil dokumentlenke** når mulig
3. skille mellom **verifisert kilde** og **lead/hypotese**
4. merke tydelig om materialet er:
   - nytt
   - validerende
   - supplerende
   - utforskende
5. alltid knyttes til et konkret prosjektspor eller et identifisert gap

Denne regelen er grunnlaget for den nye Perplexity-masterlisten i den tilhørende filen.
