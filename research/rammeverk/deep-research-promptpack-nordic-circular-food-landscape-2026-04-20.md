---
title: Deep Research Prompt Pack - Nordic Circular Food Landscape
status: aktiv
type: prompt-pack
created: 2026-04-20
purpose: Stor promptpakke for aa kartlegge sirkulaere mataktorer, forskning, rapporter og mediebilde i Norden
---

# Deep Research Prompt Pack - Nordic Circular Food Landscape

Denne fila er laget for en dag der mange Deep Research-prosesser skal kjoeres i parallell. Maalet er ikke bare aa finne "de viktigste" aktorene, men aa fa saa bred og etterproevbar dekning som mulig av:

1. sirkulaere aktorer i matsystemet i Norden
2. masteroppgaver, PhD-er og fagfellevurdert forskning
3. offentlige rapporter, bransjerapporter, NGO-rapporter og konsulentrapporter
4. mediebilde, narrativer og offentlig diskurs
5. sammenhenger, hull og neste innsiktssteg

## 1. Bruksinstruks

Kjor i batcher. Batch 1-4 kan kjoeres foerst. Batch 5 boer kjoeres etter at outputen fra de tidligere batchene foreligger.

Hver prompt er skrevet for aa kunne copy-pastes inn i en Deep Research-prosess.

## 2. Felles instruks som bor ligge i alle kjoeringer

Legg gjerne dette som preamble eller innledende instruks i alle prosessene:

```text
Search broadly and systematically across English, Norwegian, Swedish, Danish, Finnish, and Icelandic sources where relevant. Write the final output in Norwegian, but keep original names of institutions, reports, and actors in their source language when useful.

Prioritize completeness over elegance. I want a coverage-oriented research output, not a short essay.

For every major finding, include source attribution and direct links when possible.

Distinguish clearly between:
1. documented fact
2. plausible interpretation
3. hypothesis / needs verification

When mapping actors, include not only companies but also research groups, public agencies, clusters, networks, NGOs, investors, testbeds, incubators, procurement bodies, and living labs if they are materially relevant to circular food systems.

Avoid generic "green" actors unless there is a direct and evidenced link to food systems, bioresources, food waste, circular bioeconomy, nutrition, public meals, alternative proteins, feed, packaging, logistics, or nutrient loops.
```

## 3. Standard output-kontrakt

Be helst om disse seksjonene i hver output:

```text
Use this output structure:
1. Scope and method
2. Key findings
3. Structured table/list
4. Relevance for Food Systems 2026
5. Gaps and uncertainty
6. Suggested next research step
```

## 4. Batch 1 - Landvise aktorkart

### Prompt 1 - Master map for hele Norden

**Foreslaatt output-fil:** `research/interviews/nordic-circular-food-actors-master-map-2026.md`

```text
Build the most complete possible map of circular food system actors across the Nordic region: Norway, Sweden, Denmark, Finland, and Iceland. If relevant, include Faroe Islands and Greenland as a small "North Atlantic extension", but keep the main focus on the five core Nordic countries.

Map actors across these categories:
1. food waste prevention and redistribution
2. side-stream valorization and upcycling
3. biogas, biofertilizer, nutrient recycling, compost, sludge valorization
4. alternative proteins, fermentation, cultivated/precision/novel ingredients where relevant
5. circular aquaculture, feed innovation, marine side streams
6. circular packaging, reuse systems, traceability and logistics
7. public meals, procurement, institutional food systems
8. research groups, innovation centers, testbeds, living labs
9. clusters, incubators, accelerators, investors, ecosystem builders
10. NGOs, public authorities, policy labs, standard-setting or coordinating bodies

For each actor, provide:
- name
- country
- actor type
- thematic role
- business or institutional model
- stage or maturity (pilot, scaling, established, policy, research)
- why it matters for circular food systems
- website or primary source
- one or two key references

Do not stop at flagship actors. Include second-tier and emerging actors if they are relevant.

End with:
1. a country-by-country comparison
2. a thematic gap analysis
3. a shortlist of the 100 most relevant actors for Food Systems 2026
```

### Prompt 2 - Norge: komplett sirkulart aktorlandskap for mat

**Foreslaatt output-fil:** `research/bibliotek/sirkularitet/norge-sirkulart-aktorlandskap-mat-2026.md`

```text
Kartlegg det norske landskapet av aktorer som arbeider direkte med sirkularitet i matsystemet. Dette skal vaere en bred dekning, ikke bare et notat om noen faa kjente case.

Inkluder:
1. matsvinnforebygging, redistribusjon og discount/overskuddskanaler
2. sidestraum-valorisering fra jordbruk, matindustri, dagligvare og HORECA
3. biogass, biogjodsel, kompost, fosfor- og naeringsstoffgjenvinning
4. alternativt protein, fermentering, nye ingredienser, restrastoffbaserte produkter
5. havbruk, fiskeslam, marine sidestraummer, forinnovasjon
6. offentlig maaltid, storkjokken, sykehus, skolemat, offentlige innkjop
7. emballasje, ombruk, sporbarhet, matsikkerhet i sirkulaere looper
8. forskningsmiljoer, katapulter, testbeds, klynger, virkemiddelapparat
9. NGO-er, nettverk og policyaktorer med konkret matrelevans

For hver aktor:
- navn
- kategori
- lokasjon
- rolle i verdikjeden
- hva som er sirkulaert ved modellen
- hvor moden aktoren er
- samarbeidspartnere om kjent
- sentrale kilder

Avslutt med:
1. de viktigste norske blindsonene
2. hvilke aktortyper som er over- og underrepresentert
3. forslag til 20 norske aktorer som bor inn i et prioritert actor map
```

### Prompt 3 - Sverige: komplett sirkulart aktorlandskap for mat

**Foreslaatt output-fil:** `research/bibliotek/sirkularitet/sverige-sirkulart-aktorlandskap-mat-2026.md`

```text
Map the Swedish circular food systems landscape as comprehensively as possible.

Include actors in:
1. food waste prevention, redistribution, and retail/consumer rescue models
2. side-stream valorization, industrial symbiosis, and upcycled food ingredients
3. biogas, digestate, nutrient recycling, and municipal-organic-food loops
4. novel proteins, fermentation, oats, mycoprotein, algae, insects, and feed innovation
5. aquaculture circularity and marine side streams
6. public meals, school meals, municipal procurement, and sustainable catering systems
7. packaging, reuse systems, and circular logistics for food
8. research institutes, university centers, testbeds, demonstrators, and innovation programs
9. NGOs, public agencies, and ecosystem organizations

Search in Swedish and English. Write the output in Norwegian.

For each actor, capture:
- name
- country/region/city
- actor type
- circular food theme
- what the actor actually does
- level of maturity or scale
- why the actor matters in a Nordic comparison
- source links

End with:
1. the 25 most important Swedish actors
2. the strongest Swedish sub-themes
3. what Sweden has that Norway does not
```

### Prompt 4 - Danmark: komplett sirkulart aktorlandskap for mat

**Foreslaatt output-fil:** `research/bibliotek/sirkularitet/danmark-sirkulart-aktorlandskap-mat-2026.md`

```text
Kortlaeg det danske oekosystem af aktoerer, der arbejder med cirkularitet i foedevaresystemet.

Medtag:
1. madspildsforebyggelse, donation, redistribuering og outletmodeller
2. sidestraemme, opgradering, biooekonomi, bioraffinering og industriel symbiose
3. biogas, husdyrgoedning, naeringsstofkredsb, kompost og biosolutions
4. fermentering, alternative proteiner, ingredienser, foedeteknologi og fodder innovation
5. akvakultur, marine sidestraemme og feed
6. offentlige maaltider, kommunale koekener, procurement og foodservice
7. emballage, genbrug, logistik og traceability
8. universiteter, GTS-institutter, innovationsmiljoer, klynger og living labs
9. myndigheder, NGOer, policy labs og netvaerk

Write the final output in Norwegian, but search in Danish and English.

For each actor:
- navn
- type
- geografi
- hovedrolle
- hvorfor aktoren er relevant for cirkulaere foedevaresystemer
- modenhed
- centrale samarbejdspartnere hvis kendt
- kildehenvisninger

Afslut med:
1. de 25 vigtigste danske aktorer
2. Danmarks saerlige styrkepositioner
3. hvilke danske modeller der kan vaere benchmark for Food Systems 2026
```

### Prompt 5 - Finland: komplett sirkulart aktorlandskap for mat

**Foreslaatt output-fil:** `research/bibliotek/sirkularitet/finland-sirkulart-aktorlandskap-mat-2026.md`

```text
Map the Finnish circular food systems landscape with emphasis on both established institutional actors and newer innovation actors.

Include:
1. food waste prevention, redistribution, household and retail solutions
2. side-stream valorization, circular bioeconomy, biorefineries, nutrient recycling
3. biogas, digestate, nitrogen/phosphorus loops, manure and agricultural residues
4. alternative proteins, cellular agriculture where relevant, mycoprotein, fermentation, oats, insects
5. aquaculture and feed innovation
6. public meals, school meal systems, procurement, municipal sustainability programs
7. circular packaging, logistics, and digital traceability
8. universities, Luke, VTT, innovation programs, pilots, demonstrators, science parks
9. NGOs, public agencies, food policy and ecosystem builders

Search in Finnish, Swedish, and English where useful. Write in Norwegian.

For each actor, provide:
- name
- actor type
- location
- theme
- concrete relevance
- maturity/scale
- known partners
- source links

End with:
1. the top 25 Finnish actors
2. Finland's strongest niches in circular food systems
3. what Norway should learn from Finland
```

### Prompt 6 - Island og North Atlantic extension

**Foreslaatt output-fil:** `research/bibliotek/sirkularitet/island-north-atlantic-sirkulart-aktorlandskap-mat-2026.md`

```text
Map the circular food systems landscape in Iceland, and if relevant add a smaller North Atlantic extension covering Faroe Islands and Greenland where clear food-system circularity actors exist.

Focus on:
1. seafood side streams and marine circularity
2. geothermal or energy-linked food circularity
3. food waste, redistribution, local resilience, and import dependency
4. aquaculture, algae, feed, and marine biotech
5. public food systems and local procurement where relevant
6. universities, clusters, policy bodies, and innovation environments

Because the ecosystem is smaller, prioritize completeness over volume.

For each actor:
- name
- country/territory
- role
- sector
- why relevant
- maturity
- source links

End with:
1. a compact map of the Icelandic landscape
2. whether Iceland is under-covered in Nordic food transition debates
3. 10-15 actors from Iceland/North Atlantic that should not be missed
```

## 5. Batch 2 - Tematiske aktorprompts

### Prompt 7 - Matsvinn, redistribusjon og overskuddskanaler i Norden

**Foreslaatt output-fil:** `research/bibliotek/sirkularitet/norden-matsvinn-redistribusjon-aktorer-2026.md`

```text
Map the full Nordic actor landscape around food waste prevention, redistribution, discounting, resale of surplus food, donation systems, and consumer-facing rescue models.

Include:
1. NGOs and charities
2. platforms and apps
3. retailers and retail-owned initiatives
4. wholesalers and foodservice rescue channels
5. municipal or public-sector solutions
6. research environments and measurement actors
7. legal or standards actors relevant to redistribution and waste prevention

I want:
- actors by country
- actor type
- business/governance model
- evidence of scale
- known partnerships with retail, industry, or municipalities
- source links

Also identify:
1. which models are mainstreamed
2. which remain marginal
3. where Norway is ahead or behind
4. where there are serious evidence gaps
```

### Prompt 8 - Sidestraummer, biogass og naeringsstoffslukker i Norden

**Foreslaatt output-fil:** `research/bibliotek/sirkularitet/norden-sidestraummer-biogass-naeringsstoffer-aktorer-2026.md`

```text
Map Nordic actors working with food side streams, manure, sludge, digestate, compost, nutrient recovery, and biogas-linked circularity in food systems.

Include:
1. industrial plants and infrastructure operators
2. farmer cooperatives and agricultural actors
3. food industry and slaughterhouse side-stream actors
4. municipal waste and bioresource actors
5. technology providers
6. research and pilot environments
7. regulatory and policy bodies shaping nutrient-loop practice

For each actor:
- name
- country
- role in the loop
- feedstock/resource handled
- output produced
- scale or maturity
- source links

End with:
1. a typology of Nordic nutrient-loop models
2. strongest case examples
3. where there are weak or broken loops
```

### Prompt 9 - Alternativt protein, fermentering og nye ingredienser i Norden

**Foreslaatt output-fil:** `research/bibliotek/sirkularitet/norden-alt-protein-fermentering-aktorer-2026.md`

```text
Map Nordic actors in alternative proteins and circular ingredient innovation where there is a real connection to food-system circularity.

Include:
1. precision fermentation, biomass fermentation, mycoprotein, single-cell proteins
2. insect protein, algae, seaweed, legumes, oats, and other circular or resource-efficient protein pathways
3. upcycled ingredients from food side streams
4. ingredient companies, startups, scaleups, research projects, test facilities
5. investors, accelerators, and major corporate partners when relevant

Do not include every generic plant-based brand. Focus on actors that are relevant to circularity, resource efficiency, resilience, feed-food transitions, or valorization of side streams.

For each actor:
- name
- country
- technology/model
- circular relevance
- maturity
- key partners
- source links

End with:
1. the strongest Nordic clusters
2. actors closest to commercialization
3. where there is hype versus real industrial traction
```

### Prompt 10 - Havbruk, for og marine sidestraummer

**Foreslaatt output-fil:** `research/bibliotek/sirkularitet/norden-havbruk-for-marine-sidestraummer-aktorer-2026.md`

```text
Map the Nordic actor landscape around circularity in aquaculture, feed, seafood side streams, fish sludge, marine residuals, and marine bioresources.

Include:
1. feed producers and alternative feed ingredient actors
2. seafood processors valorizing by-products
3. sludge, nutrient recovery, and waste handling actors
4. algae, marine biotech, and omega-3 alternatives
5. research institutes and pilot projects
6. policy, certification, or ecosystem actors

For each actor:
- name
- country
- category
- concrete role
- why circularity-relevant
- scale or maturity
- source links

Also answer:
1. where are the most advanced Nordic marine circular loops
2. which actors shape the feed transition
3. what this means for Norwegian food-system vulnerability and opportunity
```

### Prompt 11 - Offentlige maaltider, foodservice og innkjopsmakt

**Foreslaatt output-fil:** `research/bibliotek/horeca/norden-offentlige-maaltider-foodservice-aktorer-2026.md`

```text
Map Nordic actors shaping circularity through public meals, institutional kitchens, procurement systems, catering, and foodservice.

Include:
1. municipal and national public meal programs
2. procurement agencies and competence centers
3. major foodservice wholesalers and catering actors
4. school meal, hospital meal, and care meal initiatives
5. researchers and labs focused on sustainable public food systems
6. NGOs and advisory bodies influencing public food procurement

For each actor:
- name
- country
- actor type
- role in public meal / foodservice system
- circular relevance
- scale
- source links

End with:
1. strongest Nordic examples
2. leverage points for Food Systems Transition Group
3. concrete Norwegian gaps
```

### Prompt 12 - Emballasje, ombruk, sporbarhet og sirkular logistikk

**Foreslaatt output-fil:** `research/bibliotek/sirkularitet/norden-emballasje-logistikk-sporbarhet-aktorer-2026.md`

```text
Map Nordic actors working on circular packaging, food-safe reuse, traceability, data infrastructure, reverse logistics, and circular logistics systems relevant to food.

Include:
1. packaging innovators
2. reuse system operators
3. traceability and digital infrastructure providers
4. logistics and reverse-logistics actors
5. food safety and material testing environments
6. public and regulatory actors relevant to PPWR, reuse, and food packaging circularity

For each actor:
- name
- country
- role
- relevance to food-system circularity
- current maturity
- source links

End with:
1. where the Nordic region is most advanced
2. main implementation bottlenecks
3. which actors matter most for a roadmap perspective
```

## 6. Batch 3 - Akademia, avhandlinger og forskningsprosjekter

### Prompt 13 - Nordiske forskningsmiljoer og sentre

**Foreslaatt output-fil:** `research/bibliotek/akademia/nordic-circular-food-research-groups-2026.md`

```text
Map the most relevant Nordic academic research groups, centers, institutes, and university environments working on circular food systems or directly adjacent themes.

Include:
1. food waste and redistribution
2. circular bioeconomy
3. side-stream valorization
4. biogas and nutrient loops
5. novel proteins and fermentation
6. public meals and procurement
7. aquaculture circularity and feed
8. food packaging, safety, and circular materials
9. food systems governance, policy, and transition studies

For each research environment:
- name
- institution
- country
- key researchers
- main research themes
- relevant projects/publications
- why relevant for Food Systems 2026
- source links

End with:
1. the top 30 research environments
2. where the strongest Nordic competence clusters are
3. which groups look most collaboration-relevant
```

### Prompt 14 - Norge: masteroppgaver og PhD-er

**Foreslaatt output-fil:** `research/bibliotek/akademia/masteroppgaver/norge-sirkulaer-mat-master-phd-2026.md`

```text
Kartlegg alle relevante norske masteroppgaver og doktorgrader fra 2010-2026 som kan belyse sirkularitet i matsystemet direkte eller indirekte.

Inkluder oppgaver om:
1. matsvinn
2. biogass, biookonomi, naeringsstoffgjenvinning
3. side streams, restrastoff, upcycling
4. alternativt protein, fermentering, forinnovasjon
5. offentlige maaltider og matinnkjop
6. sirkulaer emballasje og matsikkerhet
7. havbruk, fiskeslam, marine sidestraummer
8. governance, policy og overgang til sirkulaere matsystemer

Search especially in:
- NORA
- Brage
- DUO
- NMBU
- UiO
- NTNU
- NHH
- BI
- OsloMet
- UiB
- Nofima/NIBIO-linked repositories if available

For each thesis:
- author
- title
- institution
- year
- degree level
- direct link
- short relevance summary
- whether full text is openly available

I want breadth. Include peripheral but useful theses if they help understand the ecosystem.
```

### Prompt 15 - Sverige: masteroppgaver og PhD-er

**Foreslaatt output-fil:** `research/bibliotek/akademia/masteroppgaver/sverige-sirkulaer-mat-master-phd-2026.md`

```text
Map relevant Swedish master's theses and PhD dissertations from 2010-2026 related to circular food systems.

Include topics such as:
1. food waste in retail, households, or foodservice
2. circular bioeconomy and side-stream valorization
3. biogas, digestate, nutrient loops
4. public meals, school meals, municipal food procurement
5. novel proteins, oats, fermentation, feed, and marine circularity
6. packaging, safety, and circular materials for food
7. governance and food-system transition

Search Swedish repositories such as:
- DiVA
- SLU repositories
- Lund University
- Chalmers
- Stockholm University / SRC-related archives
- KTH if relevant

For each thesis/dissertation:
- author
- title
- institution
- year
- degree
- link
- short relevance summary
- open/full-text status

End with:
1. the strongest Swedish thesis clusters
2. recurring themes
3. underexplored topics
```

### Prompt 16 - Danmark: masteroppgaver og PhD-er

**Foreslaatt output-fil:** `research/bibliotek/akademia/masteroppgaver/danmark-sirkulaer-mat-master-phd-2026.md`

```text
Kortlaeg relevante danske masteropgaver og PhD-afhandlinger fra 2010-2026 om cirkularitet i foedevaresystemet.

Inkluder:
1. madspild
2. biogas og biooekonomi
3. sidestraemme og valorisering
4. fermentering, alternative proteiner og ingrediensinnovation
5. offentlig bespisning, kommunale koekener og procurement
6. emballage, food safety og cirkulaere materialer
7. havbrug, marine biprodukter og feed
8. policy, governance og transition

Search especially in:
- CBS
- University of Copenhagen
- Aarhus University
- DTU Orbit
- Aalborg University
- REX / institutional repositories where relevant

For each thesis:
- forfatter
- titel
- institution
- aar
- grad
- link
- kort relevansresume
- open access-status

Afslut med:
1. de vigtigste danske videnmiljoeer bag afhandlingerne
2. hvor Danmark ser staerkest ud
3. hvilke spor der fortjener videre research
```

### Prompt 17 - Finland: masteroppgaver og PhD-er

**Foreslaatt output-fil:** `research/bibliotek/akademia/masteroppgaver/finland-sirkulaer-mat-master-phd-2026.md`

```text
Map relevant Finnish master's theses and doctoral dissertations from 2010-2026 related to circular food systems and adjacent domains.

Include:
1. food waste and circular consumption
2. nutrient recycling and bioeconomy
3. biogas, digestate, and agricultural loops
4. novel proteins, oats, fungi, fermentation, insects
5. public meal systems and procurement
6. packaging and circular food safety issues
7. aquaculture, feed, marine and land-based circularity
8. food systems governance and transition

Search in:
- Theseus
- University of Helsinki repositories
- Aalto
- VTT-linked publication databases where relevant
- Tampere
- Turku
- LUT
- Luke-linked outputs if discoverable

For each thesis/dissertation:
- author
- title
- institution
- year
- degree
- link
- summary of relevance
- full-text availability

End with:
1. strongest Finnish knowledge niches
2. which theses seem especially important for Food Systems 2026
3. what topics seem under-covered
```

### Prompt 18 - Island og North Atlantic: masteroppgaver og PhD-er

**Foreslaatt output-fil:** `research/bibliotek/akademia/masteroppgaver/island-north-atlantic-sirkulaer-mat-master-phd-2026.md`

```text
Map relevant Icelandic and, where possible, North Atlantic master's theses and doctoral dissertations from 2010-2026 that connect to circular food systems.

Focus on:
1. seafood side streams
2. marine resource valorization
3. local food resilience and circularity
4. aquaculture and feed
5. geothermal-linked food systems where relevant
6. waste, nutrient loops, packaging, and local food innovation

Include Iceland first. Add Faroe Islands and Greenland only when real relevant academic material is identifiable.

For each thesis:
- author
- title
- institution
- year
- degree
- link
- relevance summary
- full-text status

End with:
1. what the academic base looks like in Iceland/North Atlantic
2. whether these geographies are overlooked in Nordic food transition research
3. what to follow up manually
```

### Prompt 19 - Fagfellevurdert forskning paa nordiske sirkulaere matsystemer

**Foreslaatt output-fil:** `research/bibliotek/akademia/internasjonalt/nordic-circular-food-peer-reviewed-literature-2026.md`

```text
Conduct a systematic search for peer-reviewed literature from roughly 2015-2026 that is directly relevant to circular food systems in the Nordic region.

Include literature on:
1. food waste and waste governance
2. circular bioeconomy
3. side-stream valorization
4. biogas and nutrient recovery
5. novel proteins and fermentation
6. public meals and procurement
7. aquaculture circularity
8. packaging, food safety, and circular materials
9. food-system transition and governance

Search in English and relevant Nordic language titles/abstracts if possible.

For each article:
- citation
- DOI or stable link
- theme
- country relevance
- method
- key finding
- direct relevance for Food Systems 2026

End with:
1. the 40-60 most relevant articles
2. thematic clustering
3. evidence strengths and gaps
```

### Prompt 20 - Nordiske forsknings- og innovasjonsprosjekter

**Foreslaatt output-fil:** `research/bibliotek/akademia/nordic-circular-food-projects-and-programmes-2026.md`

```text
Map research, innovation, and demonstration projects relevant to circular food systems in the Nordics from roughly 2018-2026.

Include:
1. Horizon Europe and Horizon 2020 projects with Nordic participation
2. NordForsk projects
3. Nordic Innovation projects
4. EIT Food projects
5. national research council projects
6. cluster- or city-linked demonstrators
7. living labs and testbeds

For each project:
- project name
- years
- funder
- countries involved
- leading institutions
- project theme
- main outputs if known
- why relevant for Food Systems 2026
- source links

End with:
1. the most important project families
2. where there is duplication
3. where there are obvious white spaces
```

## 7. Batch 4 - Rapporter, grey literature og mediebilde

### Prompt 21 - Offentlige og regulatoriske rapporter

**Foreslaatt output-fil:** `research/bibliotek/offentlig/nordic-circular-food-public-and-regulatory-reports-2026.md`

```text
Map public-sector and regulatory reports from 2018-2026 that are relevant to circular food systems in the Nordics.

Include:
1. ministries and agencies
2. food authorities
3. environmental authorities
4. competition authorities where relevant to circular transition
5. public procurement and municipal guidance bodies
6. Nordic Council of Ministers and EU-linked Nordic outputs

Themes:
1. food waste
2. circular bioeconomy
3. nutrient recycling
4. packaging and reuse
5. procurement and public meals
6. aquaculture and marine resources
7. resilient food systems and self-sufficiency where linked to circularity

For each report:
- title
- authoring body
- year
- geography
- theme
- short summary
- link
- direct relevance for Food Systems 2026

End with:
1. the must-read public reports
2. which countries publish the strongest material
3. where the public evidence base is thin
```

### Prompt 22 - Bransje-, konsulent- og markedsrapporter

**Foreslaatt output-fil:** `research/bibliotek/bransje/nordic-circular-food-industry-and-consultancy-reports-2026.md`

```text
Map industry reports, consultancy reports, market scans, and ecosystem analyses from 2018-2026 relevant to circular food systems in the Nordics.

Include:
1. consultancy firms
2. industry federations
3. cluster organizations
4. corporate-backed ecosystem reports
5. investor or market intelligence reports

Themes:
1. food waste
2. circular packaging
3. alternative proteins
4. bioeconomy and side streams
5. foodservice and public meals
6. aquaculture circularity
7. logistics and circular supply chains

For each report:
- title
- publisher
- year
- theme
- market/region
- summary
- whether the report appears rigorous, promotional, or mixed
- link

End with:
1. the most useful reports
2. where the private evidence base is stronger than the public one
3. where consultancy narratives may be overstating traction
```

### Prompt 23 - NGO-er, tenketanker og sivilsamfunn

**Foreslaatt output-fil:** `research/bibliotek/tenketanker/nordic-circular-food-ngo-thinktank-reports-2026.md`

```text
Map relevant NGO, think tank, foundation, and civil-society outputs from 2018-2026 on circular food systems in the Nordics.

Include organizations working on:
1. food waste
2. sustainable diets
3. circular economy and bioeconomy
4. public meals and procurement
5. marine resources and aquaculture
6. agriculture and nutrient loops
7. food justice and access where linked to circularity

For each organization and report:
- organization name
- country
- role
- key reports or outputs
- year
- summary of position
- link
- relevance for Food Systems 2026

End with:
1. a map of who shapes the public narrative
2. which NGO/think tank actors are most influential
3. which positions align or conflict with industry and state narratives
```

### Prompt 24 - Bedriftsrapporter og baerekraftspaaastander

**Foreslaatt output-fil:** `research/bibliotek/bransje/nordic-circular-food-corporate-reports-and-claims-2026.md`

```text
Map major corporate reports, sustainability reports, annual reports, and public circularity claims from Nordic food-system companies relevant to circular transition.

Include:
1. retail
2. food manufacturing
3. dairy and meat cooperatives
4. aquaculture and feed
5. foodservice wholesalers
6. packaging and logistics actors where food-specific

For each company:
- company name
- country
- relevant reports (2019-2026)
- main circularity claims
- evidence/data cited
- whether the reporting looks robust or superficial
- links

I want special attention to:
1. food waste claims
2. transport/logistics circularity claims
3. side-stream and bioeconomy claims
4. packaging/reuse claims
5. claims connected to public targets or regulation

End with:
1. strongest corporate circularity cases
2. likely weak or generic claim areas
3. where we need independent verification
```

### Prompt 25 - Norge: mediebilde om sirkulaere matsystemer

**Foreslaatt output-fil:** `research/bibliotek/media/norge-sirkulaere-matsystemer-mediebilde-2026.md`

```text
Kartlegg det norske mediebildet om sirkulaere matsystemer i perioden 2020-2026.

Jeg vil ha:
1. store narrativer og debattbolger
2. hvilke tema som faar mest dekning
3. hvilke tema som nesten ikke dekkes
4. hvilke personer, selskaper og miljoer som settes i sentrum
5. hvordan media beskriver matsvinn, biookonomi, alternativt protein, offentlig maaltid, havbruk, emballasje og selvforsyning nar de kobles til sirkularitet

Inkluder:
- riksmedier
- fagpresse
- regionale medier hvis de har viktige case
- podkaster eller debattscener om de faktisk former narrativet

Avslutt med:
1. de 10 viktigste norske narrativene
2. hvilke aktorer som dominerer offentligheten
3. hvilke tema som er underbelyst og bor inn i researchagendaen
```

### Prompt 26 - Sverige, Danmark, Finland og Island: mediebilde

**Foreslaatt output-fil:** `research/bibliotek/media/norden-sirkulaere-matsystemer-mediebilde-2026.md`

```text
Map media narratives on circular food systems across Sweden, Denmark, Finland, and Iceland from 2020-2026.

I want a comparative view, not four isolated summaries.

Track:
1. dominant narratives by country
2. flagship actors and projects most often cited
3. which topics are framed as innovation success
4. which topics are framed as controversy, regulation, or cost problem
5. whether circular food systems are mainly discussed through climate, competitiveness, security, food waste, public meals, or industrial policy

Include mainstream media, trade media, and serious policy media where relevant.

End with:
1. a country comparison matrix
2. the strongest cross-Nordic narratives
3. missing narratives that deserve more research attention
```

### Prompt 27 - Fagpresse, konferanser, podkaster og nyhetsbrev

**Foreslaatt output-fil:** `research/bibliotek/media/nordic-circular-food-trade-media-events-newsletters-2026.md`

```text
Map the trade media, conferences, summits, podcasts, newsletters, and recurring ecosystem arenas that shape the Nordic conversation on circular food systems.

Include:
1. industry trade publications
2. startup and innovation media
3. policy or sustainability newsletters
4. annual conferences and summits
5. cluster events and demo days
6. podcast series if they function as important discourse hubs

For each arena:
- name
- country/region
- format
- audience
- theme relevance
- key actors often present
- why it matters for horizon scanning and stakeholder mapping
- source link

End with:
1. the most important discourse arenas to monitor
2. which arenas are strong sources for future actor discovery
3. which ones might be useful for launch/event strategy
```

### Prompt 28 - Investorer, inkubatorer, akseleratorer og testbeds

**Foreslaatt output-fil:** `research/bibliotek/bransje/nordic-circular-food-investors-incubators-testbeds-2026.md`

```text
Map investors, incubators, accelerators, venture environments, science parks, and testbeds that are relevant to circular food innovation in the Nordics.

Include:
1. foodtech and bioeconomy investors
2. circular economy accelerators
3. test kitchens, pilot plants, fermentation facilities, packaging labs, aquaculture test environments
4. public-private innovation environments
5. university-linked commercialization platforms

For each actor:
- name
- country
- actor type
- thematic focus
- what they actually support
- whether they appear active and relevant now
- notable portfolio or project examples
- source links

End with:
1. strongest commercialization ecosystems
2. where there are bottlenecks from lab to market
3. which Nordic nodes matter most for pilot-building
```

## 8. Batch 5 - Syntese, dekningstest og videre innsiktsarbeid

Kjor disse etter at du har output fra flere av promptene over.

### Prompt 29 - Dekningsaudit og hullkart

**Foreslaatt output-fil:** `research/analyse/nordic-circular-food-coverage-audit-2026.md`

```text
Use the following completed research outputs as a corpus and perform a coverage audit:
[insert list of completed files or paste summaries]

I want you to assess whether our current research coverage of Nordic circular food systems is broad enough across:
1. countries
2. actor types
3. thematic loops
4. value-chain stages
5. research types
6. report types
7. discourse/media visibility

Produce:
1. a matrix of what is strongly covered
2. a matrix of what is weakly covered
3. specific blind spots
4. duplicate-heavy areas
5. recommended next prompts to close the biggest gaps

Be brutal and systematic. The purpose is to expose what we still do not know.
```

### Prompt 30 - Top 150 aktorer med taksonomi

**Foreslaatt output-fil:** `research/analyse/nordic-circular-food-top-150-actors-2026.md`

```text
Based on the completed actor-mapping outputs, create a single ranked and deduplicated master list of the 150 most relevant actors in Nordic circular food systems.

For each actor:
- name
- country
- actor type
- primary theme
- maturity
- why it matters
- evidence strength
- priority score for Food Systems 2026

Also create a taxonomy showing:
1. by country
2. by actor type
3. by loop/theme
4. by value-chain position
5. by likely relevance to roadmap, pilot, policy, or knowledge network

I want a usable master map, not just a merged list.
```

### Prompt 31 - Evidensstyrke og claim audit

**Foreslaatt output-fil:** `research/analyse/nordic-circular-food-claim-audit-2026.md`

```text
Review the strongest recurring claims emerging from our circular food research outputs and test how well they are actually supported.

Corpus:
[insert completed files or key claims]

For each major claim:
1. state the claim clearly
2. identify supporting evidence
3. identify contradictory or complicating evidence
4. assess whether the claim is:
   - strongly documented
   - moderately supported
   - promising but weak
   - speculative
5. rewrite the claim in publication-safe language

The goal is to make our future whitepaper and roadmap more precise and less inflated.
```

### Prompt 32 - Whitepaper- og roadmap-syntese

**Foreslaatt output-fil:** `research/analyse/nordic-circular-food-synthesis-for-whitepaper-and-roadmap-2026.md`

```text
Use the completed circular food research outputs to produce a synthesis for Food Systems 2026 that is directly useful for whitepaper writing and roadmap building.

I want you to identify:
1. the 10-15 most important cross-Nordic insights
2. the most important country differences
3. the strongest actor clusters
4. the most promising transition levers
5. the most plausible pilot areas
6. the most important policy and coordination implications

For each major insight:
- write the thesis in one sentence
- explain the mechanism in 3-5 sentences
- cite the strongest supporting material
- indicate whether it belongs in whitepaper, roadmap, actor map, or pilot brief

End with:
1. proposed chapter themes
2. proposed roadmap strands
3. unresolved questions requiring follow-up
```

## 9. Anbefalt kjoereplan for i morgen

Hvis du vil maksimere dekning uten aa miste kontroll, bruk denne rekkefolgen:

### Foerste boelge - geografisk og oekosystemisk bredde

1. Prompt 1
2. Prompt 2
3. Prompt 3
4. Prompt 4
5. Prompt 5
6. Prompt 6

### Andre boelge - tematiske looper

7. Prompt 7
8. Prompt 8
9. Prompt 9
10. Prompt 10
11. Prompt 11
12. Prompt 12

### Tredje boelge - akademia og prosjektspor

13. Prompt 13
14. Prompt 14
15. Prompt 15
16. Prompt 16
17. Prompt 17
18. Prompt 18
19. Prompt 19
20. Prompt 20

### Fjerde boelge - rapporter og diskurs

21. Prompt 21
22. Prompt 22
23. Prompt 23
24. Prompt 24
25. Prompt 25
26. Prompt 26
27. Prompt 27
28. Prompt 28

### Femte boelge - syntese

29. Prompt 29
30. Prompt 30
31. Prompt 31
32. Prompt 32

## 10. Praktisk anbefaling

For aa holde kvaliteten oppe:

1. kjor de landvise promptene i parallelle prosesser
2. kjor de tematiske promptene etterpaa, siden de vil fange aktorer landpromptene overser
3. kjor akademia- og rapportpromptene som egne boelger
4. bruk de siste syntesepromptene kun naar du faktisk har et corpus aa syntetisere

Hvis denne fila fungerer godt, kan neste steg vaere aa lage en egen oppfoelgingsfil med:

1. import-prompts for innskriving i databasen
2. prompts for prioritering av intervjuer
3. prompts for pilotbriefs og roadmap-moduler
