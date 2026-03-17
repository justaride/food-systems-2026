# Perplexity-masterliste: Food Systems 2026

**Dato:** 17. mars 2026  
**Formål:** Gi prosjektet en operativ, prioritert og repo-kompatibel masterliste med prompts som kan kjøres i Perplexity for å hente inn flere kilder, sterkere dokumentasjon og nye spor for kartleggingen.  
**Status:** Kanonisk arbeidsliste for ekstern desk research.

---

## 1. Hvordan listen skal brukes

Denne listen er laget for tre typer søk:

1. **Validering**  
   Bekreft tall, rapporter, vedtak og nyere utvikling

2. **Bibliografisk innhenting**  
   Finn masteroppgaver, PhD-er, artikler, working papers, rapportserier og arkiver

3. **Gap-lukking**  
   Finn materiale på spor som er svakt dokumentert i repoet

Kjøreregel:

- start med `Prioritet A`
- lagre råfunn i foreslått mappe
- skriv én syntesefil per prompt eller promptfamilie
- bruk `B` og `C` når `A`-materialet er tilstrekkelig dekket eller når prosjektet trenger mer dybde

---

## 2. Kvalitetskrav for alle Perplexity-søk

Kopier gjerne disse kravene inn i hver søketråd dersom Perplexity begynner å bli løs:

- prioriter **offentlige dokumenter, universitetsrepositorier, konkurransemyndigheter, statistikkbanker, working papers og årsrapporter**
- oppgi **full tittel, forfatter/institusjon, år, URL og kort relevansnotat**
- skill mellom **verifiserte primærkilder** og **sekundære leads**
- merk tydelig hvilke kilder som er **open access**, **PDF**, **portal**, **paywalled** eller **referert men utilgjengelig**
- foretrekk materiale fra **2015-2026**, men ta med eldre nøkkelverk der de er strukturelt viktige
- når tall oppgis, be om **kildedato og metode**
- når rapporter mangler fulltekst, be om **best mulig dokumentspor**: pressemelding, sammendrag, DOI, repositorium, ISSN/ISBN eller arkivlenke

---

## 3. Forholdet til eksisterende promptbibliotek

Denne listen erstatter ikke nødvendigvis `src/lib/data/research-prompts.ts`, men den er ment som **operativ masterlogg**. Den eksisterende katalogen fungerer best som råmateriale og browsing-taksonomi.

### 3.1 Eksisterende promptfamilier som bør beholdes eller gjenbrukes

- `interessenter-no-aktorkart`
- `reg-en-competition-law`
- `reg-en-eu-utp`
- `nordisk-en-market-structure`
- `nordisk-en-self-sufficiency`
- `forskning-en-hhi-grocery`
- `forskning-en-food-security`
- `matsikkerhet-en-frameworks`
- `logistikk-en-digital`
- `interessenter-en-academic`
- `media-en-international`

### 3.2 Eksisterende promptfamilier som bør revideres eller splittes

- `forskning-no-masteroppgaver`  
  Splitt i `masteroppgaver` og `PhD / doktorgrader`

- `reg-en-competition-law`  
  Splitt i `regelverk` og `enforcement / vedtak`

- `matsvinn-en-circular`  
  Splitt i `matsvinnmåling` og `verdigjenvinning / valorisering`

- `logistikk-no-saarbarhet`  
  Splitt i `fysisk/logistisk sårbarhet` og `import-/handelsavhengighet`

- `media-no-dekning`  
  Splitt i `nyhetsdekning` og `undersøkende / dokumentariske saker`

### 3.3 Viktigste manglende promptområder

- eiendomsmakt og internleie i dagligvare
- food deserts, lokal konsentrasjon og kommunevis HHI
- offentlig matinnkjøp og storkjøkken
- HORECA-leverandørkjeder
- nordiske doktorgrader / avhandlinger
- sammenliknende eierskaps- og selskapsstrukturer
- sjømatfôr, fiskemel, soya og globale avhengigheter
- subnasjonale nordiske datakilder
- operativ sirkularitetsdefinisjon for TG
- benchmark-land utenfor Norden

---

## 4. Promptlogg: oversikt

| ID | Prioritet | Status | Tema | Geografi | Foreslått lagringssted |
|---|---|---|---|---|---|
| A01 | A | Revidert | Markedsstruktur-validering | Norden | `research/norden/market-structure-validation-2026.md` |
| A02 | A | Ny | Masteroppgaver og PhD-er | Norge + Norden | `research/bibliotek/akademia/nordic-theses-and-dissertations-2026.md` |
| A03 | A | Revidert | Offentlige rapporter og policyspor | Norge + Norden | `research/bibliotek/offentlig/public-reports-masterlog-2026.md` |
| A04 | A | Ny | Leverandørmakt og enforcement gap | Norge + Norden | `research/bibliotek/bransje/leverandorperspektiv-enforcement-gap-2026.md` |
| A05 | A | Ny | Eiendomsmakt og internleie | Norge + Norden | `research/norden/eiendomsmakt-dagligvare-2026.md` |
| A06 | A | Ny | HORECA og offentlig innkjøp | Norden | `research/norden/horeca-og-offentlig-innkjop-2026.md` |
| A07 | A | Ny | Food deserts og lokal konsentrasjon | Norden | `research/norden/food-deserts-og-lokal-konsentrasjon-2026.md` |
| A08 | A | Revidert | Aktørkart og nøkkelpersoner | Norden | `research/interviews/nordic-aktorkart-2026.md` |
| A09 | A | Ny | Sjømatfôr og globale råvarekjeder | Norden + globalt | `research/norden/seafood-feed-dependencies-2026.md` |
| A10 | A | Ny | Operativ sirkularitetsdefinisjon | Norden | `research/rammeverk/sirkularitet-operativ-definisjon-2026.md` |
| B01 | B | Revidert | Buyer power / monopsony-litteratur | Internasjonalt + Norden | `research/bibliotek/akademia/buyer-power-food-retail-2026.md` |
| B02 | B | Revidert | HHI og lokal markedsmetodikk | Internasjonalt + Norden | `research/bibliotek/akademia/hhi-local-grocery-methods-2026.md` |
| B03 | B | Ny | Inntredensfiaskoer og blokkert konkurranse | Norden | `research/norden/entry-failure-cases-2026.md` |
| B04 | B | Revidert | EMV / private labels / innovasjon | Norden | `research/bibliotek/bransje/emv-private-labels-2026.md` |
| B05 | B | Ny | Logistikkontroll og essential facilities | Norden + benchmark | `research/norden/open-logistics-and-essential-facilities-2026.md` |
| B06 | B | Revidert | Selvforsyningsmetodikk og beredskap | Norden | `research/norden/self-sufficiency-methodology-debate-2026.md` |
| B07 | B | Revidert | Matsvinnmåling og valorisering | Norden | `research/norden/matsvinn-og-valorisering-2026.md` |
| B08 | B | Ny | Nordiske matstrategier og offentlige måltider | Norden | `research/norden/public-food-strategies-2026.md` |
| B09 | B | Ny | Think tanks, NGO-er og policyaktører | Norden + EU | `research/bibliotek/tenketanker/policy-ngo-landscape-2026.md` |
| B10 | B | Ny | Benchmark-land utenfor Norden | Europa + anglosfære | `research/norden/benchmark-grocery-and-food-policy-cases-2026.md` |
| C01 | C | Ny | Offentlige kontrakter og anbud | Norden | `research/bibliotek/offentlig/public-food-tenders-2026.md` |
| C02 | C | Ny | Subnasjonale nordiske datakilder | Norden | `research/norden/subnational-data-sources-2026.md` |
| C03 | C | Revidert | Medie- og undersøkende narrativer | Norge + Norden | `research/bibliotek/media/food-systems-media-timeline-2026.md` |
| C04 | C | Revidert | Finansiering, grants og videre løp | Norden + EU | `research/bibliotek/offentlig/funding-and-calls-2026.md` |
| C05 | C | Ny | Pilotbenchmarks og transition levers | Norden + benchmark | `research/evidence-pack/pilot-benchmarks-2026.md` |
| C06 | C | Ny | Urban food systems og by-logikk | Norden | `research/norden/urban-food-systems-2026.md` |
| C07 | C | Ny | Alternative distribusjonsmodeller | Norden + benchmark | `research/norden/reko-and-alternative-channels-2026.md` |

---

## 5. Prioritet A: kritiske prompts

### A01. Nordisk markedsstruktur og validering 2024-2026

- `Hvorfor:` Repoet har et sterkt nordisk markedsstrukturlag, men flere tall er fortsatt estimater og trenger ferske, sporbare kilder.
- `Bygger på:` `nordisk-en-market-structure`, `naering-no-dagligvarerapporten`, `reg-en-competition-law`
- `Ønsket output:` verifisert tabell per land med markedsandeler, CR3, HHI, distribusjonsmodell, siste strukturelle endringer og metodekommentar

```text
Kartlegg og valider markedsstruktur i dagligvare for Norge, Sverige, Danmark, Finland og Island for perioden 2024-2026. Prioriter konkurransemyndigheter, årsrapporter, NHH FOOD, offentlige statistikkbanker og andre sporbare primærkilder. For hvert land: identifiser største aktører, siste markedsandelstall, CR3, HHI eller beste mulige beregningsgrunnlag, internasjonale aktører, siste større fusjoner/oppkjøp/exit-hendelser, og hvordan tallene er målt. Oppgi full tittel, institusjon, år, lenke og 2-3 setningers relevansnotat for hver kilde. Skill mellom verifiserte tall og estimater. Lag en sluttabell som er egnet som partner-valideringsgrunnlag.
```

### A02. Norske og nordiske masteroppgaver og PhD-er om matsystem, dagligvare og verdikjede

- `Hvorfor:` Dette er et eksplisitt kunnskapshull i dagens corpus, særlig for doktorgrader og nordiske universiteter utenfor NHH.
- `Bygger på:` `forskning-no-masteroppgaver` (splittes)
- `Ønsket output:` bibliografi med fulltekstlenker, gradstype, institusjon, metode og relevans for prosjektet

```text
Søk systematisk etter norske og nordiske masteroppgaver, doktorgrader og PhD-avhandlinger fra 2010-2026 som omhandler dagligvaremarked, matsystemer, matpolitikk, selvforsyning, matsikkerhet, grossistledd, logistikk, EMV/private labels, food retail concentration, food security, food waste, public procurement eller circular food systems. Søk spesielt i Brage, NORA, DUO, NHH Brage, NMBU Brage, DiVA, SLU, Chalmers, Lund, KU, CBS, DTU, Aalto, Helsinki, Luke og islandske universitetsarkiver. For hver oppføring: forfatter, tittel, gradstype, institusjon, år, veileder hvis tilgjengelig, lenke til fulltekst eller repositorium, 2-3 setninger om hovedfunn, og tagger for tema. Skill tydelig mellom Norge og øvrige Norden.
```

### A03. Offentlige rapporter, utredninger og policyspor som må inn i basisbiblioteket

- `Hvorfor:` Offentlige dokumenter er prosjektets mest robuste grunnmur, men de er spredt mellom flere mapper og delvis ufullstendige.
- `Bygger på:` `offentlig-no-nouer`, `offentlig-no-meldinger`, `offentlig-no-riksrevisjonen`, `matsikkerhet-no-selvforsyning`
- `Ønsket output:` prioritert dokumentlogg med offentlige nøkkelkilder og hva de faktisk dokumenterer

```text
Lag en prioritert masterlogg over norske og nordiske offentlige rapporter, NOU-er, stortingsmeldinger, proposisjoner, regulatoriske gjennomganger, konkurranserapporter og beredskapsdokumenter fra 2010-2026 som er direkte relevante for kartlegging av matsystemer, dagligvaremakt, selvforsyning, matsikkerhet, matsvinn, offentlig matpolitikk og konkurranseregulering. Prioriter regjeringer, konkurransemyndigheter, matmyndigheter, Riksrevisjonen, Nordisk ministerråd og offentlige ekspertutvalg. For hvert dokument: full tittel, institusjon, år, dokumenttype, lenke, status (PDF/fulltekst/portal), kort relevansnotat og hvilken prosjektakse det støtter.
```

### A04. Leverandørmakt, handelspraksis og enforcement gap

- `Hvorfor:` Dette sporet er sentralt i whitepaperet, men mangler flere konkrete case og sammenliknbare kilder.
- `Bygger på:` `naering-no-leverandor`, `reg-en-eu-utp`, deler av `reg-en-competition-law`
- `Ønsket output:` kasusamling med lovverk, tilsynsrapporter, leverandørorganisasjoner og dokumenterte praksiser

```text
Kartlegg dokumentasjon på skjev forhandlingsmakt, unfair trading practices, leverandørfrykt, hylleplassavgifter, joint marketing, delisting-risiko og svak håndheving i norsk og nordisk dagligvare fra 2015-2026. Prioriter Dagligvaretilsynet, Konkurransetilsynet, DLF, NHO Mat og Drikke, EU UTP-materiale, finske/svenske/danske tilsyn og eventuelle leverandørundersøkelser. For hver kilde: oppgi konkret praksis som beskrives, hvem som dokumenterer den, lenke og kort vurdering av bevisstyrke. Finn også konkrete case eller sitater som kan brukes som inngang til intervju- eller fortellerspor.
```

### A05. Eiendomsmakt, internleie og kapitalstruktur i dagligvare

- `Hvorfor:` Meeting-4 peker på dette som en sentral hypotese, men dagens dekning er svak.
- `Bygger på:` nytt promptområde
- `Ønsket output:` kartlegging av selskapsstrukturer, eiendomsenheter, internleiehypoteser og eventuelle nordiske paralleller

```text
Undersøk hvordan eiendomsmakt, internleie, sale-leaseback, captive property companies og konsernintern leiepraksis brukes i dagligvare og retail i Norge og Norden. Start med NorgesGruppen, Reitan, Coop Norge, ICA, Axfood, Kesko og S-Group. Finn offentlige regnskaper, årsrapporter, eiendomsselskaper, pressemeldinger, analyser og akademiske eller juridiske kilder som kan belyse om verdier og marginer flyttes fra butikkdrift til eiendomsenheter. For hver relevant kilde: oppgi selskap, enhet, dokumenttype, år, lenke og hva kilden faktisk sier om eiendom, leie, EBITDA, investeringsstruktur eller makt over lokasjoner. Marker tydelig hva som er dokumentert og hva som fortsatt bare er hypotese.
```

### A06. HORECA, storkjøkken og offentlig innkjøp

- `Hvorfor:` Dette er identifisert som underdekket og viktig for både verdikjede og transition-spor.
- `Bygger på:` deler av `logistikk-verdikjede` og verdikjedefilen om HORECA
- `Ønsket output:` nordisk oversikt over grossister, offentlige måltider, innkjøpsregimer og nøkkelaktører

```text
Kartlegg HORECA-, food service- og storkjøkkenleddet i Norden med vekt på offentlige institusjoner, kontraktcatering og grossistledd. Finn kilder om markedets størrelse, viktigste grossister og leverandører, offentlige kjøkken i skoler, sykehus, eldreomsorg og forsvar, samt hvilke innkjøps- og bærekraftskrav som brukes. Prioriter offentlige anbudsportaler, kommunale og statlige strategier, bransjerapporter, grossistselskaper og forskningsmiljøer. For hver kilde: oppgi land, segment, dokumenttype, lenke og hva den sier om volum, aktører, regulering eller transformasjonspotensial.
```

### A07. Food deserts, butikktetthet og lokal konsentrasjon

- `Hvorfor:` Repoet har datasiden, men mangler bedre metoder, referansestudier og nordiske sammenlikninger.
- `Bygger på:` nytt promptområde
- `Ønsket output:` metodereferanser, nordiske case og data leads som kan brukes til kommune- eller regionanalyse

```text
Finn forskning, offentlige rapporter, metodedokumenter og kartleggingscase om food deserts, food access, grocery accessibility, store density, municipal-level grocery concentration og lokal HHI i Norden og sammenlignbare land. Prioriter studier fra Norge, Sverige, Danmark, Finland, Island, Storbritannia, Canada og USA der metodikken er tydelig. For hver kilde: oppgi geografisk nivå, hvordan tilgjengelighet eller konsentrasjon er målt, hvilke data som ble brukt, lenke og hvordan metoden kan overføres til Food Systems 2026. Let også etter nordiske offentlige datasett eller prosjekter som kan hjelpe med subnasjonal analyse.
```

### A08. Komplett nordisk aktørkart og nøkkelpersoner

- `Hvorfor:` Et sentralt Evidence Pack-gap og en forutsetning for Commitment Map.
- `Bygger på:` `interessenter-no-aktorkart`, `interessenter-no-nokkelpersoner`
- `Ønsket output:` strukturert aktørlogg med organisasjoner, roller, mulige kontaktpunkter og relevans

```text
Lag et strukturert nordisk aktørkart for matsystemkartlegging med fokus på Norge, Sverige, Danmark, Finland og Island. Inkluder myndigheter, konkurranseorganer, matmyndigheter, forskningsmiljøer, universitetsgrupper, næringsklynger, bransjeorganisasjoner, leverandørforeninger, NGO-er, think tanks, større selskaper, offentlige innkjøpsmiljøer og nøkkelpersoner i debatten. For hver aktør: navn, land, type, hva de representerer, hvorfor de er relevante for Food Systems 2026, eventuell kjent kontaktflate og hvilke prosjektspor de er mest knyttet til. Skill mellom organisasjoner og individer.
```

### A09. Sjømatfôr, råvareopprinnelse og globale sårbarheter

- `Hvorfor:` Vest-Afrika/fiskemel-sporet er løftet i meeting-4, men er foreløpig svakt evidensiert.
- `Bygger på:` nytt promptområde
- `Ønsket output:` kildesamling om ingrediensopprinnelse, fôravhengigheter, etiske konflikter og alternativer

```text
Kartlegg råvareopprinnelse, importavhengighet og globale sårbarheter i nordisk sjømatfôr, med særlig vekt på Norge. Undersøk fiskemel, fiskeolje, soya, vegetabilske oljer, mikroalger, insektprotein og eventuelle koblinger til Vest-Afrika eller andre regioner der fôrproduksjon skaper matsikkerhets- eller bærekraftskonflikter. Prioriter selskaper som Skretting, BioMar, Mowi Feed og relevante forsknings- eller NGO-kilder. For hver kilde: oppgi råvare, opprinnelsesregion, selskap eller institusjon, dokumenttype, år, lenke og kort forklaring på hvorfor dette er en strategisk risiko eller et transformasjonsspor.
```

### A10. Operativ definisjon av sirkularitet i nordiske matsystemer

- `Hvorfor:` Prosjektet har mye materiale om sirkularitet, men mangler en skarp, operativ TG-definisjon.
- `Bygger på:` deler av `matsvinn-en-circular`, `circular bioeconomy`-sporet og eksisterende sirkularitetsdokumenter
- `Ønsket output:` sammenlikning av rammeverk og forslag til praktiske kriterier

```text
Finn de mest relevante rammeverkene, rapportene og forskningsmiljøene som definerer hva “circular food systems” betyr i praksis, spesielt i nordisk eller europeisk kontekst. Prioriter Wageningen, Nordisk ministerråd, OECD, Ellen MacArthur Foundation, Stockholm Resilience Centre, nordiske bioøkonomimiljøer og offentlig matsvinn-/ressursforvaltning. For hver kilde: oppgi definisjon, nivå (materialer, næringsstoffer, energi, logistikk, sosial sirkularitet, offentlig innkjøp), lenke og hva som kan brukes som operativt kriteriesett for Food Systems Transition Group.
```

---

## 6. Prioritet B: strukturell dybde

### B01. Buyer power, monopsony og food retail concentration i forskningslitteraturen

- `Hvorfor:` Styrker det teoretiske grunnlaget bak markedsmaktsporet.
- `Bygger på:` `forskning-en-buyer-power`

```text
Conduct a focused search for peer-reviewed literature, working papers and high-quality policy research on buyer power, monopsony, retail concentration and value extraction in grocery and food retail markets from 2015-2026. Prioritize journals in agricultural economics, competition economics and food policy, but also include strong policy papers from competition authorities. For each source: give citation, DOI or stable link, method, main finding, and exact relevance to Nordic food retail concentration and supplier power.
```

### B02. HHI, CR3 og lokal markedsmetodikk for dagligvare

- `Hvorfor:` Nødvendig for bedre lokal analyse og for å unngå metodisk svakhet i kommune-/regionnivå.
- `Bygger på:` `forskning-en-hhi-grocery`

```text
Find academic and policy research on how HHI, CR3 and other concentration metrics are applied to grocery markets at national, regional and local level. Prioritize sources that explain geographic market definition, store-count vs revenue-share methodology, local catchment areas, and how regulators treat high grocery concentration in practice. For each source: citation, link, geographic level, metric used, methodological warning, and how the approach could be adapted to municipal analysis in Food Systems 2026.
```

### B03. Inntredensfiaskoer og blokkert konkurranse i nordisk dagligvare

- `Hvorfor:` Prosjektet trenger sterkere historiske case på hvorfor nye aktører ikke slipper inn.
- `Bygger på:` nytt promptområde

```text
Kartlegg sentrale nordiske case der nye dagligvareaktører mislyktes, ble blokkert eller fikk svekket konkurransekraft, inkludert Lidl i Norge, ICAs kollaps i Norge, Aldi-exit i Danmark, City Gross i Sverige og andre relevante case. Finn akademiske arbeider, konkurranserapporter, årsrapporter, mediegraving og bransjeanalyser. For hver case: beskriv hva som skjedde, hvilke strukturelle barrierer som ble identifisert, hvilke kilder som dokumenterer det, og hvordan caset belyser inngangsbarrierer i matmarkedet.
```

### B04. EMV / private labels, innovasjon og prispress

- `Hvorfor:` EMV er et nøkkelspor i makt- og differensieringsanalysen.
- `Bygger på:` eksisterende EMV-prompts og bibliotekmateriale

```text
Kartlegg forskning, offentlige rapporter og bransjeanalyser om private labels / egne merkevarer i nordisk dagligvare fra 2015-2026. Fokuser på effekter på leverandører, innovasjon, prisgjennomsiktighet, forbrukervalg, marginer og sammenlignbarhet mellom kjeder. For hver kilde: oppgi land, kilde, dokumenttype, lenke og 2-3 setninger om hvordan EMV beskrives som konkurranseverktøy eller konkurranseproblem.
```

### B05. Logistikkontroll, grossistmakt og “essential facilities”

- `Hvorfor:` Dette er en kjerne i Nordstad-sporet og et mulig pilot-/policyspor.
- `Bygger på:` nytt promptområde

```text
Undersøk forskning, regulatoriske dokumenter og caser om grossistkontroll, vertikalt integrert distribusjon, open logistics access og “essential facilities” i grocery og retail. Prioriter Norden, men inkluder benchmark-case fra telecom, energi, jernbane eller andre sektorer dersom de brukes som analogier for åpne nettverk. For hver kilde: oppgi sektor, jurisdiksjon, hvordan tilgangsproblemet beskrives, lenke og hva dette kan bety for norsk/nordisk dagligvaredistribusjon.
```

### B06. Selvforsyningsmetodikk, matbalanser og beredskapsmodeller

- `Hvorfor:` Repoet har sterke tall, men fortsatt behov for metodisk ryddearbeid og bedre sammenlignbarhet.
- `Bygger på:` `nordisk-en-self-sufficiency`, `matsikkerhet-en-frameworks`

```text
Kartlegg hvordan selvforsyning, food balance sheets, preparedness and emergency food supply are measured and debated in Norway, Sweden, Denmark, Finland and Iceland. Prioritize NIBIO, Luke, Jordbruksverket, Statistics Denmark, Statistics Iceland, FAOSTAT and preparedness authorities. For each source: state whether self-sufficiency is measured calorically, by commodity, by energy or by policy target; note the methodology; provide link; and explain how comparable the figures are across countries.
```

### B07. Matsvinnmåling, bioressurser og valorisering

- `Hvorfor:` Dette sporet finnes, men trenger tydeligere skille mellom måling og løsninger.
- `Bygger på:` `matsvinn-en-circular` (splittes)

```text
Finn de viktigste nordiske kildene om matsvinnmåling, food loss methodology, organic waste streams, nutrient recovery, biogas, animal feed reuse and other valorization pathways in food systems. Del resultatet i to deler: 1) hvordan matsvinn måles, 2) hvordan ressurser gjenvinnes eller oppgraderes. For hver kilde: oppgi land, institusjon, dokumenttype, lenke og hvilken del av verdikjeden den gjelder.
```

### B08. Nordiske matstrategier, offentlige måltider og statlige mål

- `Hvorfor:` Trengs for å koble matsystemanalyse mot faktisk offentlig styring og etterspørsel.
- `Bygger på:` nytt promptområde

```text
Kartlegg nasjonale og kommunale strategier for offentlige måltider, skolemat, sykehusmat, eldreomsorg, økologiske mål og bærekraftige innkjøp i Norden fra 2015-2026. Prioriter regjeringer, storbyer, offentlige veiledere og forskningsmiljøer. For hver kilde: oppgi land/by, institusjon, dokumenttype, lenke og hva strategien faktisk forplikter eller anbefaler.
```

### B09. Think tanks, NGO-er og policyaktører i nordisk matsystemdebatt

- `Hvorfor:` Prosjektet har medie- og akademispor, men mangler en egen sweep av policy- og påvirkningsmiljøer.
- `Bygger på:` nytt promptområde

```text
Lag en kartlegging av think tanks, NGO-er, policyinstitutter, forskningsnettverk og advocacy-miljøer som former nordisk debatt om matsystemer, dagligvaremakt, selvforsyning, kosthold, klima og sirkularitet. Prioriter Norden, men ta også med sterke europeiske referansemiljøer når de brukes i nordisk debatt. For hver aktør: navn, land, type, hovedtema, viktige publikasjoner eller programmer, lenke og hvorfor de er relevante for Food Systems 2026.
```

### B10. Benchmark-land utenfor Norden

- `Hvorfor:` Trengs for å unngå at nordisk sammenlikning blir for lukket.
- `Bygger på:` deler av UK/CMA-sporet, men utvides

```text
Find benchmark country cases outside the Nordics that are useful for comparing grocery concentration, public food policy, supplier protection, food-system resilience or circular food practice. Prioritize the UK, Netherlands, Germany, France, Ireland, Canada, New Zealand and any other country with unusually relevant regulation or food-system governance. For each case: identify why it is a benchmark, key documents, links and what lesson could transfer to a Nordic food systems whitepaper.
```

---

## 7. Prioritet C: utforskende og implementeringsnære prompts

### C01. Offentlige kontrakter, anbud og institusjonsmarkedet

- `Hvorfor:` Viktig for å konkretisere kjøpermakt og mulige transition-levers i praksis.

```text
Kartlegg åpne kilder til offentlige kontrakter, anbud, rammeavtaler og innkjøpsdata for mat til skoler, sykehus, eldreomsorg, forsvar og andre offentlige institusjoner i Norden. Identifiser hvilke portaler, databaser og dokumenttyper som gir mest verdi. For hver kilde: oppgi land, portal, tilgangstype, hvilke data som finnes og hvordan dette kan brukes til å forstå offentlig kjøpermakt i matsystemet.
```

### C02. Subnasjonale nordiske datakilder

- `Hvorfor:` Dagens subnasjonale granularitet er svak utenfor Norge.

```text
Finn subnasjonale åpne datakilder i Norden som kan støtte analyse av butikktilgang, prisvariasjon, logistikk, havner, matproduksjon, matsvinn, offentlige kjøkken eller andre relevante matsystemindikatorer på kommune-, fylkes-, region- eller bynivå. Prioriter offentlige geoportaler, statistikkbanker, kommunale dataplattformer og regionale analyseenheter. For hver kilde: oppgi geografisk nivå, tema, format, lenke og hvor brukbar kilden virker for Food Systems 2026.
```

### C03. Mediedekning og undersøkende narrativer om matsystemmakt

- `Hvorfor:` Gir cases, konflikter og innganger til intervjuer og policy-respons.
- `Bygger på:` `media-no-dekning`, `media-en-international` (splittes)

```text
Lag en strukturert oversikt over norsk, nordisk og internasjonal mediedekning fra 2020-2026 om dagligvaremakt, matpriser, grossistkontroll, leverandørkonflikter, matsikkerhet, matsvinn, sjømatfôr og offentlig innkjøp. Skill mellom vanlig nyhetsdekning og undersøkende journalistikk / dokumentarer / lange feature-saker. For hver sak: medium, dato, tittel, lenke, hovedpåstand og hvorfor saken er relevant for videre kartlegging eller intervjuarbeid.
```

### C04. Finansiering, grants og videre løp

- `Hvorfor:` Trengs for concept note og videre prosjektløp, men er ikke første kritiske evidensgap.
- `Bygger på:` eksisterende finansieringsprompts, samles i én familie

```text
Kartlegg relevante finansieringskilder, grants, calls, programmer og investeringsspor fra 2024-2027 som kan finansiere videre arbeid med nordiske matsystemer, sirkulær økonomi, beredskap, offentlig innkjøp, bioøkonomi eller data-/policyprosjekter. Prioriter Nordic Innovation, Nordisk ministerråd, Horizon Europe, Interreg, EIB, NIB, Forskningsrådet, Innovasjon Norge og relevante stiftelser. For hver kilde: navn, type, beløpsnivå, tematisk relevans, tidsvindu, lenke og hvorfor den passer eller ikke passer Food Systems 2026.
```

### C05. Pilotbenchmarks og transition levers

- `Hvorfor:` Skal gjøre det lettere å gå fra analyse til konkrete pilotforslag.

```text
Finn nordiske og internasjonale pilotcase, demonstratorer eller reformprosjekter som kan fungere som benchmark for Food Systems Transition Group. Se etter case om åpen logistikk, offentlig matinnkjøp, kortere verdikjeder, matsvinnreduksjon, næringsgjenvinning, urban matproduksjon, skolemat, alternative distribusjonsmodeller eller andre systemendringer. For hver case: oppgi aktør, land, kort beskrivelse, lenke, hva som ble testet og hvorfor caset er relevant som mulig pilotspor.
```

### C06. Urban food systems og koblingen til by- og sirkularitetsagendaen

- `Hvorfor:` Prosjektet peker mot bysporet, men mangler tydelig kartlegging av feltet.

```text
Kartlegg nordiske og europeiske kilder om urban food systems, city-region food systems, circular cities with food components, municipal food strategies and urban resilience related to food. Prioriter OECD, EU-prosjekter, Nordregio, nordiske storbyer, universitetsmiljøer og kommunale strategidokumenter. For hver kilde: oppgi by/region, institusjon, dokumenttype, lenke og hvordan den kobler mat, logistikk, avfall, beredskap eller offentlig innkjøp til urban transformasjon.
```

### C07. REKO, direktesalg og alternative distribusjonskanaler

- `Hvorfor:` Gir motbilder til triopol og kan bli viktig i pilot- eller policyspor.

```text
Kartlegg nordiske og relevante internasjonale case om REKO-ringer, andelslandbruk, bondedistribusjon, kooperative modeller, digitale direktesalgskanaler og andre alternative distribusjonsformer for mat. Finn forskning, rapporter, evalueringer og praksiscase fra 2015-2026. For hver kilde: oppgi modell, land, skala, dokumenttype, lenke og hvilke barrierer eller suksessfaktorer som beskrives.
```

---

## 8. Anbefalt kjørerekkefølge

Foreslått sekvens for de første 10 Perplexity-kjøringene:

1. `A01` nordisk markedsstruktur og validering
2. `A02` masteroppgaver og PhD-er
3. `A03` offentlige rapporter og policyspor
4. `A08` aktørkart og nøkkelpersoner
5. `A04` leverandørmakt og enforcement gap
6. `A06` HORECA og offentlig innkjøp
7. `A07` food deserts og lokal konsentrasjon
8. `A05` eiendomsmakt og internleie
9. `A09` sjømatfôr og globale avhengigheter
10. `A10` operativ sirkularitetsdefinisjon

Deretter:

- `B02`, `B05` og `C02` hvis lokal analyse skal styrkes
- `B08`, `C01` og `C05` hvis prosjektet går inn i pilot- og policyspor
- `C04` når concept note og videre finansieringsløp skal konkretiseres

---

## 9. Minimumskrav til output når en prompt er kjørt

Hver gjennomført prompt bør ende i én kort leveranse med:

- dato
- prompt-ID
- brukt prompttekst
- 10-30 kilder eller færre hvis feltet er smalere
- 5-10 viktigste funn
- vurdering av kildekvalitet
- hva dette lukker av gap
- hva som fortsatt gjenstår
- anbefalt neste prompt

Dette gjør at masterlisten kan fungere som en faktisk forskningslogg og ikke bare som en liste med idéer.
