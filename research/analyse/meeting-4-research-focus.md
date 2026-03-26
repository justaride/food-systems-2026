# Research Focus Report: Meeting-4 — Strategisk ledergruppe Marked, 16. mars 2026

**Dokument-ID:** FS2026-M4-FOCUS
**Dato:** 16. mars 2026
**Deltakere:** Einar Kleppe Holthe, Jan Thomas Odegard, Cathrine Barth, Thea Martinsen, Martin Hagen, Gabriel Freeman
**Formål:** Destillere forsknings- og utviklingstråder fra meeting-4 til prioritert handlingsliste

---

## 1. Hypoteser som trenger evidens

### 1.1 Eiendomsmodellen i dagligvare

**Påstand fra møtet:** Kjedene leier av seg selv til høy pris, skaper "fiktivt kapitaltap" som driver matpriser oppover. Eiendomsselskapene er profittsentrene — butikkdriften fremstår som marginalt lønnsom.

**Eksisterende dekning:**
- `research/bibliotek/juridisk/eiendomsmakt-lokal-konkurranse.md` — 1-siders factsheet. Dekker negative servitutter, reguleringsplaner og særskilt opplysningsplikt. Dokumenterer NorgesGruppen Eiendom (1M+ kvm). Mangler selve profitabilitetstesten.

**Gap:**
- Ingen kvantifisering av lease-back-marginer (internleie vs. markedsleie)
- Ingen sammenligning av EBITDA: eiendomsselskap vs. butikkdrift per kjede
- Ikke kartlagt tilsvarende strukturer i Sverige/Danmark/Finland
- Mangler kobling til matprisanalysen (ins-22: Norge 24% dyrere enn Sverige)

**Forskningsbehov:**
1. Selskapsstruktur-analyse via Brønnøysundregistrene/offentligdata: NorgesGruppen Eiendom AS, Reitangruppen Eiendom, Coop Eiendom
2. Regnskapssammenligning: eiendoms- vs. handelsselskaper per kjede (siste 3 år)
3. Nordisk sammenligning: har ICA/Axfood/Kesko/S-Group tilsvarende eiendomsstrukturer?
4. Akademisk litteratur: lease-back i retail som marginstrategi

### 1.2 Food desert-paradokset

**Påstand fra møtet:** Norge har samtidig for høy butikktetthet (kjedene leier for mye eiendom, spiser marginer) OG matørkener (food deserts der innbyggere mangler tilgang innen 5 km).

**Eksisterende dekning:**
- Food desert-analyse finnes i kodebasen (`research/brocode-kart/components/FoodDesertPanel.tsx`, `FoodDesertLayer.tsx`)
- Kartvisualisering vist i møtet — godt mottatt
- Butikkdata plottet per kommune

**Gap:**
- Mangler narrativ analyse: hva betyr det at det er food deserts i et land med 96% markedskonsentrasjon?
- Ingen sårbarhetsdimensjon: hvem bor i matørkener? (demografi, inntekt, alder)
- Ikke koblet til ins-37 (1 av 12 husholdninger viser matfattigdom)
- Mangler nordisk sammenligning av butikktetthet vs. befolkningstetthet

**Forskningsbehov:**
1. Overlay food desert-data med SSB demografidata (inntekt, alder, innvandrerbakgrunn)
2. Definere "optimal butikktetthet" — hvor mange butikker per 1000 innbyggere er for mange/for få?
3. Sammenligne med danske/svenske/finske food desert-studier
4. Koble til SIFO Dyrtid 4-rapport om matfattigdom

### 1.3 Fiskefôr og Vest-Afrika

**Påstand fra møtet (Cathrine):** Guardian-oppslag om at Vest-Afrikanske fiskerier (Sardinella) overfiskes for å fôre norsk oppdrettslaks. Lang, sårbar verdikjede.

**Eksisterende dekning:**
- ins-30: Skretting/Nutreco kontrollerer ~40% av norsk laksefôr (utenlandsk eid)
- Sirkularitet-dyp.md dekker insektprotein som alternativ fôrkilde
- Ingen direkte dekning av Vest-Afrika-koblingen

**Gap:**
- Guardian-artikkelen ikke verifisert eller arkivert
- Verdikjede-mapping for laksefôr-ingredienser mangler (soya, fiskemel, vegetabilske oljer — opprinnelsesland)
- Etisk/geopolitisk dimensjon: matsikkerhetskonflikt mellom norsk laks og vest-afrikansk proteinforsyning
- Ikke koblet til EUDR (deforestation-direktivet) som allerede er kartlagt

**Forskningsbehov:**
1. Finne og verifisere Guardian-artikkelen
2. Kartlegge råvareopprinnelse for norsk laksefôr (Skretting, BioMar, Mowi Feed)
3. Kvantifisere: hvor mange tonn Sardinella/annet fiskemel importeres til norsk fôrproduksjon?
4. Koble til insektprotein-alternativet (Invertapro kan erstatte 5-10% av soyaimport)

---

## 2. Konseptuelle gap som må defineres

### 2.1 Sirkularitetskobling — "Hva har dette med sirkularitet å gjøre?"

**Kontekst:** Cathrine reiste eksplisitt spørsmålet i møtet. Ten Step Start v1 manglet en tydelig sirkularitetsdefinisjon for Food Systems. "Hvilken del av sirkulær økonomien ser vi på — ressursknapphet, flyktighet?"

**Eksisterende dekning:**
- `research/bibliotek/sirkularitet-dyp.md` — svært sterk (547 linjer). Dekker matsvinn, biogass, fosfor-gjenvinning, insektprotein, kaskademodellen. Men fokuserer på norske/danske data, ikke på koblingen til TG-rammeverket.

**Gap:**
- Ingen definisjon av hva "sirkulær" betyr spesifikt for Food Systems TG
- Kaskademodellen (Wageningen) er dokumentert men ikke operasjonalisert for nordisk kontekst
- Mangler gate-kriterium: når er en Food Systems-aktivitet "sirkulær nok" for TG-rammeverket?
- Sirkularitet i `sirkularitet-dyp.md` er material/energi-fokusert — mangler sosial sirkularitet (redistribusjon, matfattigdom, tilgang)

**Nødvendig leveranse:**
- 1-2 siders posisjonsdokument: "Sirkularitet i Food Systems TG — operativ definisjon"
- Forankre i EMF-rammeverket (Cities and Circular Economy for Food) + Wageningen-kaskaden
- Definere 3-4 sirkulære intervensjonstyper for prosjektet

### 2.2 Food + Cities-relasjon

**Kontekst:** Møtet brukte betydelig tid på forholdet mellom Food Systems og Cities. Er Food en subsektor av City? Et parallelt system? Integrert?

**Posisjoner fra møtet:**
- Cathrine: "City er jo ekstremt konkret [...] det tverrsektorielle"
- Einar: "Byen er et system [...] City Life handler om det som fungerer i [byen]"
- Jan Thomas: "EU-søknaden er veldig byggorientert"
- Gabriel: Mat i by-kontekst vist gjennom kartdata (butikktetthet, food deserts, akvakultur)

**Eksisterende dekning:**
- EMF "Cities and Circular Economy for Food" referert i sirkularitet-dyp.md
- Ingen dedikert analyse av Food-City-nexus i nordisk kontekst

**Gap:**
- Ingen avklart metodisk posisjon: er Food en TG parallell med Cities, eller et tema innenfor Cities?
- Mangler nordisk urban food systems-kartlegging (hvem jobber med mat i byene?)
- ISO-standarden for urban sirkularitet (nevnt av Cathrine) ikke kartlagt

**Nødvendig leveranse:**
- Avklare i Ten Step Start v2.0-revisjon
- Kartlegge 5-10 nordiske byer med eksplisitt food systems-strategi

### 2.3 Nordisk definisjon av sirkulær by

**Kontekst (Cathrine):** "OECD-måten, Sørtecombe-måten, EBI-måten — men vi har egentlig ikke en nordisk forståelse av hva det er."

**Gap:**
- OECD Circular Cities-rammeverk ikke kartlagt
- EBI-definisjoner ikke kartlagt
- Ingen sammenligning av Helsinki, København, Stockholm, Oslo på sirkulær bypolitikk
- ISO urban symbioser-standard (nevnt av Cathrine) ikke dokumentert

---

## 3. Datainfrastruktur og tekniske løsninger

### 3.1 GEO-Monitor

**Status:** Cathrine skal sende GEO-monitoren til Gabriel for monitoreringsarbeid.
**Avhengighet:** Venter på Cathrine
**Integrasjon:** Må kobles til eksisterende kartvisualisering og databaseinfrastruktur

### 3.2 API-abonnementer for medieanalyse

**Kontekst (Gabriel → Einar):** For dypere medieoversikter trengs API-tilgang til mediekanaler. Gabriel kan produsere lignende innsikt som kommersielle tjenester, men trenger data-tilgang.

**Nødvendig leveranse:**
- Liste over aktuelle API-leverandører (Retriever/Infomedia, Meltwater, Mention, etc.)
- Kostnadsestimat per leverandør
- Dekningsomfang: norske vs. nordiske medier
- Einar forbereder kostnadsestimat basert på Gabriels liste

**Teknisk behov:**
- Daglig/ukentlig automatisert mediescanning
- Filtrering på nøkkelord (matsystem, dagligvare, beredskap, sirkularitet, etc.)
- Sentimentanalyse og trendsporing over tid

### 3.3 Nordisk granularitet

**Kontekst (Cathrine):** "Hva slags nøkkeldata trenger vi fra de forskjellige nordiske landene?"

**Status per land (basert på eksisterende research):**

| Datakategori | Norge | Danmark | Sverige | Finland | Island |
|:---|:---|:---|:---|:---|:---|
| Butikkstruktur | God (SSB) | Begrenset | Begrenset | Begrenset | Minimal |
| Markedsandeler | God (KT-rapport) | God (Dansk Erhverv) | God (Konkurrensverket) | God (KKV) | Minimal |
| Selvforsyning | God (NIBIO) | God (DST) | God (Jordbruksverket) | God (Luke) | Delvis |
| Matsvinn | God (Matvett) | God (Miljøstyrelsen) | God (Naturvårdsverket) | Begrenset | Minimal |
| Matpriser | God (SSB/Eurostat) | God | God | God | Delvis |
| Eiendomsstruktur | Mulig (Brønnøysund) | Ukjent | Ukjent | Ukjent | Ukjent |
| Subnasjonalt (kommune) | Delvis | Delvis | Delvis | Delvis | N/A |

**Hovedgap:** Subnasjonale data (kommunenivå) for butikktetthet, matpriser, food deserts — mangler i alle land utenom Norge.

### 3.4 Notion ↔ Database-kommunikasjon

**Status:** Gabriel har satt opp bidireksjonell kommunikasjon mellom Notion og egen database/plattform. Alle kan jobbe i Notion; Gabriel henter og synkroniserer.

**Avklart i møtet:** Notion er felles arbeidsplattform. Gabriels system kommuniserer med Notion, ikke omvendt. Ingen motsetning.

---

## 4. Aktører og nettverk å kartlegge

### 4.1 Rethink Food (Danmark/NRU-kluster)

**Kontekst (Cathrine):** "De har kontakt med kluster i Danmark og NRU. Men det er veldig godt innspill."
**Status:** Ikke engasjert ennå. Identifisert som nøkkelmiljø.
**Aksjon:** Inkludere i aktørkartlegging, prioritere for tidlig kontakt.

### 4.2 Canada-initiativ

**Kontekst (Jan Thomas):** Nordiske statsministre + Canada-initiativ på mat/Arktis. "Det nordiske er plutselig litt mer relevant, og EU er litt sånn uklart."
**Status:** Politisk kontekst — styrker nordisk dimensjon. Ikke kartlagt utover nyhetsreferanse.
**Aksjon:** Kartlegge hva Canada-nordisk-initiativet konkret innebærer for matsystemer.

### 4.3 Aktørregister — største gap

**Status:** Aktørkartlegging pågår i bakgrunnen (Gabriel). Eksisterende:
- `research/interviews/aktorkart-systematisk-2026.md` — påbegynt
- 14 norske mataktører kartlagt med omsetning (ins-26)
- Familiedynastier og eierskap dokumentert (ins-28)

**Gap:**
- Ingen strukturert database over 30-50 nøkkelaktører på tvers av Norden
- Mangler: tenketanker, forskingsmiljøer, NGOer, myndigheter per land
- Ikke kategorisert: hvem er alliert, hvem er motstandere, hvem er nøytrale?
- HORECA-aktører knapt dekket (se 4.4)

**Nødvendig leveranse:**
- Aktørdatabase med felter: navn, land, type, kontaktperson, relevans, status
- Prioritert liste for intervjuer (fase 2)

### 4.4 HORECA-leverandørkjeder

**Eksisterende dekning:**
- ins-24: Sverige/Finland har gratis skolemåltider
- ins-25: København 84% økologisk i offentlige kjøkkener
- `research/norden/verdikjede/05-horeca.md` — finnes men ikke dyptgående
- Meeting-2: "HORECA er en av raskest voksende industrier med lavest utdanning"

**Gap:**
- Leverandørkjeder til HORECA knapt kartlagt (hvem leverer til restauranter, kantiner, institusjoner?)
- Offentlige innkjøp ikke analysert (se seksjon 5)
- Grossistledd mellom produsent og HORECA ikke dokumentert
- Enorm sektor: "77% av matproduksjonen" (meeting-2)

---

## 5. Policy og regulering å kartlegge

### 5.1 Beredskapsutredninger

**Kontekst (Jan Thomas):** "Tusen utredninger pågår."

**Kjent:**
- Matsystemutvalget (Høie) — NOU innen november 2026 (ins-40)
- Meld. St. 11 — selvforsyningsmål 50%
- Matsvinnloven — ikraft 2026
- Riksrevisjonens beredskapsrapport 2023 (kartlagt)
- NIBIO selvforsyningsmetodikk (kartlagt)

**Ikke kartlagt:**
- Totaloversikt over pågående utredninger relatert til mat, beredskap, forsyningssikkerhet
- Forsvarskommisjonens anbefalinger om matberedskap
- DSBs (Direktoratet for samfunnssikkerhet) analyser
- Kommunale/regionale beredskapsplaner for mat

### 5.2 Governance-nivå

**Kontekst (Cathrine):** "Kommunalt nivå, fylkesnivå, statsnivå — på hvilket nivå begynner man?"

**Gap:**
- Ingen kartlegging av hvem som eier matsikkerhetspolitikken per governance-nivå
- Kommunenes rolle i matforsyning (reguleringsplaner, offentlige innkjøp, kantinedrift)
- Fylkeskommunenes rolle (regional matpolitikk, næringsutvikling)
- Statlige aktører: Mattilsynet, Landbruksdirektoratet, DSB, Helsedirektoratet — ansvarsfordeling

### 5.3 Nordisk klimamatpolitikk

**Eksisterende dekning:**
- `research/norden/regulatorisk-kartlegging.md` og `regulatory-policy-landscape-nordic.md` — finnes
- `research/regulatory/nordic-regulatorisk-sammenligning-2026.md` — finnes

**Gap:**
- Subsidieanalyse per land (hvem subsidierer hva, og hvor mye?)
- Skatteanalyse: matmoms, sukkeravgift, CO₂-avgift på landbruk
- Klimamål for landbrukssektoren per land
- Grensehandel-effekten av avgiftsforskjeller (ins-23: NOK 11,3 mrd)

### 5.4 Offentlig innkjøp (procurement)

**Eksisterende dekning:**
- ins-25: København 84% økologisk i offentlige kjøkkener — eneste datapunkt
- Ingen systematisk analyse

**Gap:**
- Ingen oversikt over nordiske offentlige innkjøpspolicyer for mat
- Volumestimat: hvor mye mat kjøper offentlig sektor i hvert nordisk land?
- Økologisk-andel i offentlige kjøkkener per land
- Lokalmatkrav i offentlige anbud
- Sirkulære kriterier i matinnkjøp

---

## 6. Metodikk og leveranser

### 6.1 Ten Step Start v2.0

**Status:** Cathrine ønsker revisjon. Spesielt sirkularitetsdimensjonen mangler. Gabriel har satt opp strukturen i plattformen. Einar: "Jeg har ikke noe problem med å finne opp en egen pilot 10 steps for Food."

**Nødvendig:** Drøftingsmøte Cathrine + Gabriel (planlagt onsdag). Revidere med fokus på:
- Sirkularitets-gate (hva kvalifiserer som sirkulært?)
- Operasjonalisering av kartleggingsfasen
- Kobling Food ↔ Cities

### 6.2 Intervjumetodikk

**Kontekst (Cathrine):** To spor:
1. **Bred kartlegging:** 3-4 nøkkelspørsmål, enkel survey/Google Form. "Hvem mener selv at de er relevante?" Lav terskel, stort volum.
2. **Dybdeintervju:** Klassisk innsiktsintervju med utvalgte nøkkelaktører. Cathrine: "Den tar vi veldig godt."

**Nødvendig leveranse:**
- Utforme 3-4 spørsmål for bred survey
- Sette opp distribusjonskanal (Google Forms / Notion form)
- Definere kriterier for hvem som får dybdeintervju
- Tidsplan: survey ut i april, dybdeintervjuer mai?

### 6.3 Whitepaper-format

**Avklart (Einar):** "20 sider, en mini-whitepaper, eller hundre sider hvis man har masse digital informasjon."

**Format-beslutning:**
- Primærleveranse: 20-siders mini-whitepaper + presentasjon til lanseringsevent i juni
- Sekundært: Digital plattform med full dybde (database, kart, analyse)
- Presentasjon på "sesonglanseringen" — siste uke juni

---

## 7. Prioriteringsmatrise

| # | Forskningspunkt | Kritisk for juni | Gjennomførbart nå | Ekstern avhengighet |
|:---|:---|:---|:---|:---|
| 1 | Eiendomsmodell — selskapsstruktur-analyse | **Ja** | **Ja** (offentlige register) | Nei |
| 2 | Sirkularitetsdefinisjon for TG | **Ja** | **Ja** (internt) | Nei |
| 3 | Aktørregister — 30-50 nøkkelaktører | **Ja** | **Ja** (pågår) | Nei |
| 4 | Food desert + sårbarhet-overlay | **Ja** | **Ja** (SSB-data) | Nei |
| 5 | Ten Step Start v2.0-revisjon | **Ja** | **Ja** | Cathrine-drøfting |
| 6 | Nordisk granularitet — nøkkeldata per land | **Ja** | **Delvis** (noen kilder mangler) | Nei |
| 7 | Survey-design (3-4 spørsmål) | **Ja** | **Ja** | Cathrine-godkjenning |
| 8 | Fiskefôr-verdikjede (Vest-Afrika) | Viktig | **Delvis** (Guardian-kilde trengs) | Cathrine-link |
| 9 | Offentlige innkjøp — nordisk oversikt | Viktig | **Ja** | Nei |
| 10 | HORECA-leverandørkjeder | Viktig | **Delvis** | Data-tilgang |
| 11 | Beredskapsutredninger — totaloversikt | Viktig | **Ja** (offentlige dokumenter) | Nei |
| 12 | Food+Cities metodisk avklaring | **Ja** | Krever diskusjon | Team-avklaring |
| 13 | GEO-Monitor integrasjon | Viktig | Nei | **Cathrine sender** |
| 14 | API-abonnementer medieanalyse | Viktig | Nei | **Einar kostnadsestimat** |
| 15 | Canada-nordisk initiativ | Kontekst | **Ja** | Nei |
| 16 | Rethink Food-kontakt | Fase 2 | Nei | **Kontaktperson trengs** |
| 17 | Governance-nivå kartlegging | Viktig | **Ja** | Nei |
| 18 | Subsidie/skatteanalyse nordisk | Viktig | **Delvis** | Data-innhenting |
| 19 | Nordisk sirkulær by-definisjon | Kontekst | **Delvis** (OECD/EBI-kilder) | Nei |
| 20 | Whitepaper-disposisjon | **Ja** (april) | Etter prioritering | Team-beslutning |

### Anbefalt prioritetsrekkefølge (mars-april)

**Uke 12-13 (nå → 30. mars):**
1. Sirkularitetsdefinisjon — drøftes onsdag
2. Ten Step Start v2.0 — drøftes onsdag
3. Eiendomsmodell — selskapsstruktur (kan kjøres parallelt med data-tools)
4. Aktørregister — fortsette kartlegging

**Uke 14-16 (april):**
5. Food desert + sårbarhet
6. Survey-design og utsending
7. Nordisk granularitet — systematisk datainnhenting
8. Fiskefôr-verdikjede
9. Beredskaps- og governance-kartlegging
10. Whitepaper-disposisjon

**Mai-juni (leveransefase):**
11. Dybdeintervjuer med prioriterte aktører
12. HORECA-analyse
13. Offentlige innkjøp
14. Whitepaper-skriving og presentasjon

---

## Vedlegg: Referanser til eksisterende filer

| Fil | Status | Relevans |
|:---|:---|:---|
| `src/lib/data/meetings.ts` (meeting-4) | Oppdatert | Primærkilde for denne rapporten |
| `Strategisk ledergruppe Marked 16 mars 2026.md` | Transkripsjon | Full møtetranskripsjon |
| `research/bibliotek/juridisk/eiendomsmakt-lokal-konkurranse.md` | 1 side, tynn | Må utvides vesentlig (seksjon 1.1) |
| `research/bibliotek/sirkularitet-dyp.md` | 547 linjer, sterk | Mangler TG-kobling (seksjon 2.1) |
| `src/lib/data/insights.ts` | 42 innsikter | God dekning, noen gap identifisert |
| `research/bibliotek/nordisk-matmakt-historikk.md` | Oversiktsdokument | God kontekst |
| `research/brocode-kart/components/FoodDesertPanel.tsx` | Kode finnes | Mangler narrativ (seksjon 1.2) |
| `research/interviews/aktorkart-systematisk-2026.md` | Påbegynt | Må skaleres (seksjon 4.3) |
| `research/norden/verdikjede/05-horeca.md` | Finnes | Må utdypes (seksjon 4.4) |
| `research/norden/regulatorisk-kartlegging.md` | Finnes | Subsidie/skatt mangler (seksjon 5.3) |

---

*Generert: 16. mars 2026 | Basert på meeting-4 transkripsjon og eksisterende research-bibliotek*
