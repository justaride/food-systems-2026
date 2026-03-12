import type { ResearchCategory, ResearchPrompt } from '@/lib/types'

export const categoryLabels: Record<ResearchCategory, { label: string; description: string }> = {
  'boker-akademisk': {
    label: 'Boker og akademisk',
    description: 'Boker, avhandlinger og akademisk litteratur om matsystemer'
  },
  'forskningsartikler': {
    label: 'Forskningsartikler',
    description: 'Fagfellevurderte artikler og working papers'
  },
  'naeringspublikasjoner': {
    label: 'Naeringspublikasjoner',
    description: 'Arsrapporter, bransjeanalyser og naeringsoversikter'
  },
  'offentlige-rapporter': {
    label: 'Offentlige rapporter',
    description: 'NOUer, stortingsmeldinger og tilsynsrapporter'
  },
  'regulatorisk': {
    label: 'Regulatorisk',
    description: 'Lover, forskrifter og regulatorisk kartlegging'
  },
  'nordisk-komparativ': {
    label: 'Nordisk komparativ',
    description: 'Sammenligning av nordiske matsystemer og politikk'
  },
  'matsikkerhet': {
    label: 'Matsikkerhet',
    description: 'Selvforsyning, beredskap og matsikkerhet'
  },
  'matsvinn-sirkulaer': {
    label: 'Matsvinn og sirkulaer',
    description: 'Matsvinn, sirkulaer okonomi og bioressurser'
  },
  'logistikk-verdikjede': {
    label: 'Logistikk og verdikjede',
    description: 'Distribusjon, forsyningskjeder og saarbarhet'
  },
  'interessenter': {
    label: 'Interessenter',
    description: 'Aktoerer, organisasjoner og nokkelpeople'
  },
  'finansiering': {
    label: 'Finansiering',
    description: 'Virkemidler, forskningsfond og tilskudd'
  },
  'mediedebatt': {
    label: 'Mediedebatt',
    description: 'Mediedekning, politiske posisjoner og opinion'
  },
}

export const researchPrompts: ResearchPrompt[] = [
  // 1. Boker og akademisk litteratur (3)
  {
    id: 'bok-no-dagligvare',
    category: 'boker-akademisk',
    title: 'Norske boker om dagligvaremarked og matmakt',
    prompt: `Lag en komplett bibliografi over norske boker, rapporter og akademiske verk som omhandler det norske dagligvaremarkedet, matmakt og matpolitikk utgitt siden 2000. Inkluder:

1. Boker og monografier om norsk dagligvarekonsentrasjon, maktforhold mellom kjedene og leverandorer, og matpolitikk
2. Sentrale referanser som NOU 2011:4 "Mat, makt og avmakt", arbeider av Frode Steen og Tommy Staahl Gabrielsen (NHH), og forskning fra SIFO/OsloMet
3. For hver bok/verk: forfatter(e), tittel, forlag/utgiver, ar, ISBN om tilgjengelig, og en kort oppsummering (2-3 setninger) av hovedargumentet
4. Kategoriser etter tema: markedskonsentrasjon, forbrukerpolitikk, landbrukspolitikk, matvarekjeder, EMV (egne merkevarer)
5. Angi om verket er fritt tilgjengelig digitalt (PDF, open access) og i sa fall lenke

Dekk perioden 2000-2026. Vektle boker som har hatt innflytelse pa norsk dagligvaredebatt og politikkutforming. Inkluder bade akademiske utgivelser og mer populaervitenskapelige boker som har natt et bredere publikum.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Strukturert bibliografi med 20-40 verk, kategorisert etter tema, med metadata og tilgjengelighet',
    language: 'no'
  },
  {
    id: 'bok-en-food-retail',
    category: 'boker-akademisk',
    title: 'International books on food retail concentration',
    prompt: `Compile a comprehensive bibliography of influential English-language books on food retail concentration, supermarket power, and food system governance published since 2000. Include:

1. Key works by Tim Lang (Food Wars, Feeding Britain), Marion Nestle (Food Politics), Philip Howard (Concentration and Power in the Food System), Raj Patel, and other major food system scholars
2. Reports and books from IPES-Food, ETC Group, Oxfam, and other organizations studying corporate concentration in food
3. Academic monographs on buyer power, vertical restraints, and competition policy in grocery markets
4. For each work: author(s), title, publisher, year, and a 2-3 sentence summary of the main argument and relevance to Nordic food system analysis
5. Note which works have been translated to Scandinavian languages or have been explicitly cited in Nordic policy debates

Prioritize works that provide theoretical frameworks applicable to analyzing the Norwegian/Nordic grocery market structure (3 dominant chains controlling 96%+ of market). Include both critical food studies perspectives and mainstream economics approaches.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Annotated bibliography of 30-50 works with thematic categorization and relevance to Nordic analysis',
    language: 'en'
  },
  {
    id: 'bok-no-nordisk-mat',
    category: 'boker-akademisk',
    title: 'Nordisk matsystemlitteratur',
    prompt: `Kartlegg akademisk litteratur og sentrale publikasjoner om nordiske matsystemer, med fokus pa baerekraft, resiliens og systemtenkning. Inkluder:

1. Publikasjoner fra Stockholm Resilience Centre om matssystemer, planetaere grenser og EAT-Lancet-kommisjonen
2. Forskning fra NIBIO, NMBU og norske institusjoner om norsk landbruk og matproduksjon
3. Svenske bidrag fra SLU (Sveriges lantbruksuniversitet) og Chalmers om nordisk mat
4. Nordisk Ministerrad-publikasjoner om matpolitikk, barekraftig mat og nordisk samarbeid
5. For hvert verk: forfatter(e), tittel, utgiver, ar, og kort oppsummering av relevans for norsk matsystemanalyse

Fokuser spesielt pa verk som anvender systemtenkning, verdikjedeanalyse eller makt-perspektiver pa nordisk matproduksjon og -distribusjon. Inkluder bade vitenskapelige artikler samlet i antologier og frittstaaende rapporter. Angi sprak (NO/SE/DK/EN) for hvert verk.`,
    model: 'gemini-deep-research',
    expectedOutput: 'Tematisk organisert oversikt med 25-35 nordiske publikasjoner, sprakmarkert og relevansvurdert',
    language: 'no'
  },

  // 2. Forskningsartikler (4)
  {
    id: 'forskning-en-buyer-power',
    category: 'forskningsartikler',
    title: 'Buyer power in food retail — peer-reviewed',
    prompt: `Conduct a systematic search for peer-reviewed academic articles on buyer power, market concentration, and competition issues in food retail markets. Search parameters:

1. Databases: Google Scholar, SSRN, Web of Science, Scopus
2. Journals: Journal of Agricultural Economics, European Review of Agricultural Economics, Journal of Competition Law & Economics, World Competition, Agribusiness
3. Time period: 2015-2026
4. Key search terms: "buyer power" AND "grocery" OR "food retail"; "market concentration" AND "supermarket"; "monopsony" AND "food supply chain"; HHI AND "grocery"

For each article found, provide:
- Full citation (APA format)
- DOI link
- Abstract summary (3-4 sentences)
- Methodology used (empirical/theoretical/case study)
- Key findings relevant to highly concentrated markets (CR3 > 90%)
- Whether the article references Nordic/Scandinavian markets

Prioritize articles that develop or apply frameworks for measuring the effects of retail concentration on: supplier margins, consumer prices, product variety, innovation, and food system resilience. Include both industrial organization economics and food policy perspectives.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Systematic review table with 30-50 articles, citations, methodology, and key findings',
    language: 'en'
  },
  {
    id: 'forskning-en-food-security',
    category: 'forskningsartikler',
    title: 'Food security and supply chain resilience post-COVID',
    prompt: `Search for peer-reviewed research on food security and supply chain resilience in Northern Europe, focusing on lessons from COVID-19 and the Ukraine crisis. Include:

1. Articles analyzing food supply chain disruptions in Nordic countries during 2020-2024
2. Research on import dependency and vulnerability in small, open economies with concentrated retail
3. Studies comparing Nordic food security approaches (Norway's agricultural protectionism vs. Sweden/Denmark/Finland)
4. Post-Ukraine analysis of food price transmission, fertilizer dependency, and strategic reserves
5. Resilience frameworks applied to food systems — adaptive capacity, redundancy, diversity metrics

For each article: full citation, DOI, 3-sentence summary, and specific relevance to Norwegian food system vulnerability analysis. Search Google Scholar, PubMed (for food safety intersection), and specialized databases like AGRIS and CAB Abstracts.

Highlight articles that quantify the relationship between market concentration and supply chain resilience — does oligopoly increase or decrease systemic risk?`,
    model: 'perplexity',
    expectedOutput: 'Curated list of 20-30 articles with focus on concentration-resilience nexus',
    language: 'en'
  },
  {
    id: 'forskning-no-masteroppgaver',
    category: 'forskningsartikler',
    title: 'Norske masteroppgaver og doktorgrader',
    prompt: `Sok systematisk etter norske masteroppgaver og doktorgrader som omhandler det norske dagligvaremarkedet, matmakt, forsyningskjeder eller matpolitikk. Sok i:

1. Brage (fellesrepositorium for norske institusjoner)
2. NORA (Norwegian Open Research Archives)
3. DUO (Universitetet i Oslo digitale arkiv)
4. NHH Brage — spesielt konkurranseokonomiske oppgaver
5. NMBU Brage — landbruksokonomi og matvitenskap
6. BI Brage — strategi og verdikjedeanalyser

Soketermer: "dagligvare", "dagligvaremarkedet", "matmakt", "NorgesGruppen", "Coop", "Reitan", "ASKO", "egne merkevarer", "EMV", "handelsbetingelser", "god handelsskikk", "markedskonsentrasjon", "HHI dagligvare"

For hver oppgave: forfatter, tittel, institusjon, ar, grad (master/PhD), veileder om tilgjengelig, og 2-3 setningers sammendrag av funn. Kategoriser etter tema: markedsstruktur, prising, leverandorforhold, forbrukerperspektiv, regulering, logistikk.

Dekk perioden 2010-2026. Prioriter oppgaver som har empiriske data eller nye analytiske bidrag.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Database med 30-50 oppgaver, kategorisert etter tema og institusjon, med lenker til fulltekst',
    language: 'no'
  },
  {
    id: 'forskning-en-hhi-grocery',
    category: 'forskningsartikler',
    title: 'HHI and concentration metrics in grocery retail',
    prompt: `Find academic and policy research that applies Herfindahl-Hirschman Index (HHI) and other concentration metrics to grocery/food retail markets globally. Include:

1. Articles calculating HHI for national grocery markets — which countries have been studied?
2. Methodological discussions: HHI at national vs. local market level, relevant geographic market definition
3. Threshold analysis: what HHI levels trigger regulatory concern in grocery specifically?
4. Alternative metrics: CR3, CR5, Lorenz curves, entropy measures applied to food retail
5. Comparative studies ranking countries by grocery market concentration

For context: Norway's grocery market has CR3 ≈ 96% (NorgesGruppen ~44%, Coop ~29%, Reitan ~23%), implying HHI ≈ 3,400+ at national level. Find research that contextualizes this level of concentration internationally.

Include both academic articles and reports from competition authorities (CMA, EC DG Competition, Nordic competition authorities). For each source: citation, HHI/concentration data reported, methodology, and key conclusions about market power implications.`,
    model: 'perplexity',
    expectedOutput: 'Comparative table of HHI values across 15-20 countries with methodological notes',
    language: 'en'
  },

  // 3. Naeringspublikasjoner (3)
  {
    id: 'naering-no-arsrapporter',
    category: 'naeringspublikasjoner',
    title: 'Arsrapporter dagligvarekjedene 2020-2026',
    prompt: `Systematiser informasjon fra arsrapporter og baerekraftsrapporter fra de tre store dagligvaregrupperingene i Norge for perioden 2020-2026:

1. NorgesGruppen: arsrapporter, baerekraftsrapporter, EMV-strategi (Eldorado, Jacobs, Unik), ASKO logistikk-tall, digitalisering
2. Coop Norge: arsrapporter, medlemsdata, Coop Extra-vekst, EMV (Coop, X-tra, Smak Forskjellen), Prix-satsing
3. Reitan Retail (Rema 1000): arsrapporter, "bestevenn"-strategi, vertikal integrasjon (Norsk Kylling, Grans, Bakehuset), EMV

For hvert ar og hver gruppering, ekstraher:
- Omsetning og resultat
- Markedsandel (om oppgitt)
- Antall butikker
- EMV-andel og strategi
- Viktigste strategiske initiativer
- Logistikk og distribusjonsnett
- Baerekraftsambisjoner og -resultater

Presenter som strukturert tabell med trender over perioden. Angi kilder med direkte lenker til rapportene der tilgjengelig.`,
    model: 'gemini-deep-research',
    expectedOutput: 'Tidsserie-tabell 2020-2026 for alle tre grupper med nokkeltall og strategiske trender',
    language: 'no'
  },
  {
    id: 'naering-no-leverandor',
    category: 'naeringspublikasjoner',
    title: 'DLF og NHO Mat og Drikke — leverandorperspektiv',
    prompt: `Kartlegg publikasjoner og posisjoner fra leverandorsiden i norsk dagligvare for perioden 2018-2026:

1. DLF (Dagligvareleverandorenes Forening): arsrapporter, hooringsuttalelser, posisjonsnotater om handelsbetingelser, JM (joint marketing), hylleplass, delisting-problematikk
2. NHO Mat og Drikke: bransjeanalyser, innspill til dagligvaremeldinger, eksportdata, kompetansebehov
3. Nortura, TINE, Orkla og andre store leverandorer: relevante uttalelser om maktbalanse

Fokuser pa:
- Dokumenterte ubalanser i forhandlingsmakt
- Konkrete eksempler pa handelspraksis (retroaktive krav, ensidig endring av betingelser)
- Leverandorenes syn pa Lov om god handelsskikk og Dagligvaretilsynet
- EMV vs. merkevarer — leverandorenes perspektiv pa marginpress
- Innspill til Stortinget og departementene

For hver kilde: organisasjon, dokumenttype, dato, hovedpoenger (3-5 kulepunkter), og lenke om tilgjengelig.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Kronologisk oversikt med 20-30 dokumenter fra leverandorsiden, med hovedpoenger og lenker',
    language: 'no'
  },
  {
    id: 'naering-no-dagligvarerapporten',
    category: 'naeringspublikasjoner',
    title: 'Dagligvarerapporten og markedsdata 2020-2026',
    prompt: `Samle og systematiser data fra Dagligvarerapporten (Virke/NielsenIQ) og tilsvarende markedsanalyser for 2020-2026:

1. Virke Dagligvarerapporten: arlige markedsandeler, omsetningsutvikling, kjedeoversikt, butikktyper
2. NielsenIQ/GfK: kategoridata, prisutvikling, handlemonstre, e-handel
3. Konkurransetilsynets dagligvarerapporter: marginanalyser, prissammenligninger

Ekstraher for hvert ar:
- Markedsandeler per kjede/gruppering (NorgesGruppen, Coop, Reitan, ovrige)
- Omsetning dagligvare totalt og per butikkonsept (lavpris vs. supermarked vs. hypermarked)
- Prisutviklingstrender og prisindekser
- E-handel andel og vekst (Oda, kolonial, click-and-collect)
- Antall butikker og butikkdod/nyetableringer
- EMV-andeler over tid

Presenter som datasett med tidsserier egnet for visualisering. Angi eksakt kilde for hvert datapunkt.`,
    model: 'gemini-deep-research',
    expectedOutput: 'Strukturert datasett med arlige markedsdata 2020-2026, kildehenvisninger per datapunkt',
    language: 'no'
  },

  // 4. Offentlige rapporter og NOUer (4)
  {
    id: 'offentlig-no-nouer',
    category: 'offentlige-rapporter',
    title: 'NOUer om mat, jordbruk og konkurranse',
    prompt: `Lag en komplett oversikt over alle Norges offentlige utredninger (NOUer) som er relevante for matsystemanalyse, dagligvaremarked, jordbruk og konkurranse. Inkluder:

1. NOU 2011:4 "Mat, makt og avmakt — om styrkeforholdene i verdikjeden for mat" — hovedfunn, anbefalinger, oppfolging
2. NOU 2022:14 "Inntektssystemet for kommunene" — relevant for distriktsperspektiv pa matforsyning
3. NOU 2019:18 "Skattlegging av vannkraftverk" — relevant for verdikjedebeskatning-analogi
4. NOU 2020:12 "Næringslivets betydning for levende og bærekraftige lokalsamfunn"
5. Alle andre NOUer 2000-2026 som berorer: dagligvare, matproduksjon, landbruk, konkurranse, forbrukervern, beredskap, selvforsyning

For hver NOU:
- Nummer og tittel
- Utvalgsleder og sentrale medlemmer
- Mandat (kort)
- Hovedkonklusjoner og anbefalinger (5-10 kulepunkter)
- Oppfolging: ble anbefalingene implementert? Hvilke ble forkastet?
- Lenke til fulltekst pa regjeringen.no

Vurder ogsa relevante Stortingsmeldinger som bygger pa eller responderer pa disse NOUene.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Komplett NOU-database med 10-15 utredninger, hovedfunn og implementeringsstatus',
    language: 'no'
  },
  {
    id: 'offentlig-no-konkurransetilsynet',
    category: 'offentlige-rapporter',
    title: 'Konkurransetilsynets dagligvarerapporter',
    prompt: `Kartlegg alle relevante publikasjoner fra Konkurransetilsynet om dagligvaremarkedet i perioden 2010-2026:

1. "Konkurransen i dagligvaremarkedet" — alle utgaver av denne periodiske rapporten
2. Marginstudier: beregninger av bruttomargin, nettomargin og marginutvikling i verdikjeden
3. Prisjegeren/Prisjakt: data og analyser fra prissammenligningsverktoy
4. Vedtak og saker: fusjons-/oppkjopssaker (f.eks. NorgesGruppen/Bunnpris), etterforskninger
5. Horingsinnspill til Lov om god handelsskikk og Dagligvaretilsynet
6. Rapporter om grensehandel og prisforskjeller Norge-Sverige

For hver publikasjon:
- Tittel, dato, dokumenttype
- Hovedfunn med kvantitative data (marginer, priser, markedsandeler)
- Konkurransetilsynets vurderinger og anbefalinger
- Eventuell politisk respons
- Lenke til PDF/nettside

Fremhev funn som viser utviklingen i maktbalanse mellom kjeder og leverandorer over tid.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Kronologisk oversikt med 15-25 publikasjoner, nokkeltall og lenker',
    language: 'no'
  },
  {
    id: 'offentlig-no-riksrevisjonen',
    category: 'offentlige-rapporter',
    title: 'Riksrevisjonen — matsikkerhet og beredskap',
    prompt: `Finn og oppsummer alle relevante rapporter fra Riksrevisjonen som berorer matsikkerhet, jordbrukspolitikk og beredskap:

1. Riksrevisjonens undersokelse av norsk matvareberedskap
2. Revisjoner av Mattilsynet og mattrygghet
3. Undersokelser av jordbrukspolitikkens maloppnaelse
4. Revisjoner av importvern og tollforvaltning for matvarer
5. Beredskapsrevisjoner som inkluderer matforsyning

For hver rapport:
- Dokumentnummer og tittel
- Undersokelsesperiode
- Hovedfunn (hva fungerer, hva svikter)
- Riksrevisjonens kritikk og alvorlighetsgrad
- Departementets svar
- Stortingets behandling og oppfolging
- Lenke til fulltekst

Kontekstualiser funnene i lys av pastaende kriser (COVID-19, Ukraina) og debatt om norsk selvforsyningsgrad.`,
    model: 'perplexity',
    expectedOutput: 'Oversikt med 5-10 Riksrevisjonsrapporter, kritikkniva og oppfolgingsstatus',
    language: 'no'
  },
  {
    id: 'offentlig-no-meldinger',
    category: 'offentlige-rapporter',
    title: 'Stortingsmeldinger og proposisjoner',
    prompt: `Kartlegg relevante Stortingsmeldinger (Meld. St.) og lovproposisjoner (Prop. L) for matsystem- og dagligvareanalyse:

1. Meld. St. 11 (2023-2024) — om selvforsyning og matberedskap: mal, virkemidler, kritikk
2. Meld. St. 4 (2015-2016) — om dagligvaremarkedet: konkurranseforhold, forslag
3. Prop. 33 L (2019-2020) — Lov om god handelsskikk: lovforarbeid, Stortingsbehandling
4. Meld. St. 13 (2020-2021) — Klimaplan: matsystemrelevante tiltak
5. Jordbruksoppgjoret — siste 5 ars hovedtall og trender
6. Andre relevante meldinger om naering, konkurranse, forbrukervern, distriktspolitikk

For hver melding/proposisjon:
- Nummer, tittel, ansvarlig departement
- Hovedinnhold og forslag (5-8 kulepunkter)
- Stortingsbehandling: komiteinnstilling, votering, eventuelle anmodningsvedtak
- Oppfolging og implementeringsstatus
- Partipolitiske skillelinjer
- Lenke til Stortinget.no og regjeringen.no

Vis hvordan disse dokumentene henger sammen og danner rammeverket for norsk matpolitikk.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Strukturert oversikt med 8-12 meldinger/proposisjoner, behandlingsstatus og sammenhenger',
    language: 'no'
  },

  // 5. Regulatorisk kartlegging (4)
  {
    id: 'reg-no-handelsskikk',
    category: 'regulatorisk',
    title: 'Lov om god handelsskikk — lovhistorikk og praksis',
    prompt: `Lag en komplett analyse av Lov om god handelsskikk i dagligvarebransjen:

1. Lovhistorikk: fra NOU 2013:6 via horinger til Prop. 33 L (2019-2020) og ikrafttredelse 2021
2. Lovens innhold: forbud mot urimelige handelspraksiser, informasjonsplikt, forhandlingsplikter
3. Dagligvaretilsynet: mandat, organisering, ressurser, tilsynsleder, saker behandlet
4. Praksis sa langt: anonyme tips, veiledningssaker, eventuelle vedtak og sanksjoner
5. Evaluering: har loven endret samarbeidsklimaet? Leverandorenes og kjedenes syn
6. Sammenligning med EU UTP-direktivet — er norsk lov strengere/mildere?

Inkluder:
- Tidslinje fra forste forslag til dagens praksis
- Sitater fra hooringsrunden (DLF, NHO, kjedene, Forbrukerradet)
- Dagligvaretilsynets arsrapporter og uttalelser
- Akademisk evaluering om tilgjengelig
- Lenker til lovtekst, forarbeider og tilsynets nettside`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Komplett lovhistorikk-tidslinje med praksisoversikt og evaluering',
    language: 'no'
  },
  {
    id: 'reg-en-eu-utp',
    category: 'regulatorisk',
    title: 'EU UTP Directive — Nordic implementation',
    prompt: `Analyze the implementation of EU Directive 2019/633 on Unfair Trading Practices (UTP) in the agricultural and food supply chain across the Nordic countries:

1. Directive overview: key prohibitions (black list and grey list practices), scope, enforcement mechanisms
2. Implementation per country:
   - Sweden: how transposed, enforcement body, cases
   - Denmark: how transposed, enforcement body, cases
   - Finland: existing §4a competition law provisions + UTP transposition
   - Norway: not EU member but adopted similar Lov om god handelsskikk — compare scope and enforcement
   - Iceland: implementation status
3. Comparative analysis:
   - Which countries went beyond minimum harmonization?
   - Differences in scope (turnover thresholds, covered products)
   - Enforcement effectiveness: number of complaints, investigations, sanctions
   - Anonymous reporting mechanisms
4. Industry assessment: has the directive changed trading practices? Evidence from supplier surveys

Provide a comparison matrix showing the key differences in Nordic implementation. Include academic or policy evaluations of the directive's effectiveness published 2022-2026.`,
    model: 'perplexity',
    expectedOutput: 'Comparative matrix of Nordic UTP implementation with enforcement data',
    language: 'en'
  },
  {
    id: 'reg-en-competition-law',
    category: 'regulatorisk',
    title: 'Competition law for grocery — Nordic comparison',
    prompt: `Compare competition law frameworks as applied to grocery/food retail across the Nordic countries and UK:

1. Norway: Konkurranseloven, Konkurransetilsynet's grocery market powers, merger control thresholds
2. Finland: Competition Act §4a (specific grocery provisions), Finnish Competition and Consumer Authority (KKV) grocery investigations
3. Sweden: Konkurrenslagen, Konkurrensverket grocery market studies
4. Denmark: Konkurrenceloven, KFST grocery reports
5. UK: CMA Grocery Market Investigation (2000, 2008), Groceries Supply Code of Practice, Groceries Code Adjudicator

For each jurisdiction:
- Legal basis for grocery-specific regulation
- Market definition approach (national vs. local)
- Merger control: thresholds, recent decisions in grocery
- Abuse of dominance/buyer power cases
- Sector-specific instruments (codes of practice, ombudsmen)
- Key reports and investigations (last 10 years)

Create a comparison table covering: legal framework, enforcement body, market concentration level (CR3/HHI), specific grocery provisions, and notable cases. Assess which Nordic country has the most effective competition regime for grocery markets.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Detailed comparison table across 5 jurisdictions with legal analysis',
    language: 'en'
  },
  {
    id: 'reg-en-uk-cma',
    category: 'regulatorisk',
    title: 'UK CMA grocery investigation as benchmark',
    prompt: `Provide a detailed analysis of the UK Competition and Markets Authority (and predecessor Competition Commission) grocery market investigations as a benchmark for Nordic markets:

1. Competition Commission Grocery Market Investigation 2008:
   - Scope, methodology, key findings on supplier relationships
   - The Groceries Supply Code of Practice (GSCOP) — what it covers
   - Groceries Code Adjudicator (GCA) — mandate, powers, cases
2. Post-investigation outcomes (2008-2026):
   - Has GSCOP improved supplier-retailer relationships? Evidence
   - GCA annual surveys: fear factor, compliance trends
   - Landmark cases: Tesco, other retailers investigated
3. CMA follow-up studies and market monitoring
4. Lessons for Norway:
   - UK CR5 ≈ 67% (Tesco, Sainsbury's, Asda, Morrisons, Aldi) vs. Norway CR3 ≈ 96%
   - Transferable mechanisms: what from UK model could work in Norway?
   - What doesn't transfer: market structure differences
5. Academic evaluation of UK grocery regulation effectiveness

Include references to UK Parliamentary inquiries (EFRA Committee), academic articles evaluating GSCOP/GCA, and industry body positions. This is intended as a benchmark case study for potential Norwegian policy development.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Comprehensive case study with timeline, outcomes data, and transferability analysis',
    language: 'en'
  },

  // 6. Nordisk komparativ analyse (3)
  {
    id: 'nordisk-en-market-structure',
    category: 'nordisk-komparativ',
    title: 'Cross-Nordic grocery market structure',
    prompt: `Create a detailed comparative analysis of grocery market structure across all Nordic countries (Norway, Sweden, Denmark, Finland, Iceland):

For each country provide:
1. Market size (total grocery sales in EUR/local currency)
2. Number of stores and store density per capita
3. Top chains and their parent companies with market shares (CR1, CR3, CR5)
4. HHI calculation at national level
5. Market structure: share of discount vs. supermarket vs. hypermarket
6. Private label (EMV) penetration rate
7. E-commerce grocery share and growth
8. International chains present (Lidl, Aldi, etc.) and their impact
9. Wholesale/distribution structure
10. Key regulatory differences affecting market structure

Present as a structured comparison matrix. Include data sources for each figure (Nielsen, Euromonitor, national statistics, competition authorities).

Context: This analysis supports a project examining why Norway has uniquely high concentration (CR3 ≈ 96%) compared to other Nordics. Identify structural, historical, and regulatory factors explaining differences between countries.`,
    model: 'gemini-deep-research',
    expectedOutput: 'Country comparison matrix with quantitative data and structural analysis',
    language: 'en'
  },
  {
    id: 'nordisk-en-self-sufficiency',
    category: 'nordisk-komparativ',
    title: 'Nordic self-sufficiency and agricultural policy',
    prompt: `Compare agricultural policy and food self-sufficiency across the Nordic countries:

1. Self-sufficiency rates:
   - Norway: ~50% calorie-based (Meld. St. 11), methodology debate
   - Sweden: ~50% but different calculation method, recent "food strategy" focus
   - Denmark: net food exporter (~300%), different challenge
   - Finland: ~80%, strong self-sufficiency tradition (Huoltovarmuuskeskus)
   - Iceland: limited agriculture, high fish/dairy self-sufficiency

2. Agricultural policy frameworks:
   - Norway: Jordbruksavtalen, import tariffs, market regulation boards (Omsetningsradet)
   - EU members (Sweden, Denmark, Finland): CAP framework, direct payments, rural development
   - Differences in support levels (PSE/TSE from OECD data)

3. Strategic reserves and food security preparedness:
   - Finland's National Emergency Supply Agency as benchmark
   - Norway's decommissioned grain reserves — current debate about reinstatement
   - Sweden's recent "total defense" food security focus

4. Trade policy implications:
   - Norway's WTO/EEA constraints on agricultural protection
   - EU single market effects on Nordic food trade

Provide quantitative comparison table and policy analysis. Identify best practices Norway could adopt.`,
    model: 'perplexity',
    expectedOutput: 'Policy comparison with self-sufficiency data tables and best-practice recommendations',
    language: 'en'
  },
  {
    id: 'nordisk-no-samarbeid',
    category: 'nordisk-komparativ',
    title: 'Nordisk samarbeid om matsystemer',
    prompt: `Kartlegg paagende og nylig avsluttede nordiske samarbeidsprosjekter og -initiativer innen matsystemer:

1. Nordisk Ministerraad:
   - Programme for Sustainable Food Systems
   - Ny Nordisk Mat / New Nordic Food
   - Rapporter om nordisk matpolitikk og baerekraft
   - Nordisk deklarasjon om mat og helse

2. Nordic Innovation:
   - Prosjekter innen sirkulaer okonomi og mat
   - Nordic Food Innovation initiatives
   - Finansierte prosjekter 2020-2026

3. NordForsk:
   - Forskningsprogrammer om mat, landbruk, bioressurser
   - Nordiske forskningsnettverk innen food systems
   - Finansieringsmuligheter for tverrnordiske prosjekter

4. Andre:
   - Nordisk Atlantsamarbeid (NORA) — matrelaterte prosjekter
   - Nordisk Genressurssenter (NordGen)
   - Nordic Council of Ministers for Fisheries, Aquaculture, Agriculture, Food and Forestry (MR-FJLS)

For hvert initiativ: navn, organisasjon, budsjett, tidsperiode, deltakende land, og relevans for norsk matsystemanalyse. Identifiser muligheter for a koble Food Systems 2026-prosjektet til eksisterende nordisk samarbeid.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Katalog med 15-25 nordiske initiativer, med koblingsmuligheter for prosjektet',
    language: 'no'
  },

  // 7. Matsikkerhet og selvforsyning (3)
  {
    id: 'matsikkerhet-no-selvforsyning',
    category: 'matsikkerhet',
    title: 'Norsk selvforsyningsmetodikk og debatt',
    prompt: `Analyser den norske debatten om selvforsyningsgrad og matberedskap:

1. Beregningsmetodikk:
   - NIBIOs beregninger: kaloribasis vs. proteinbasis vs. verdibasis
   - Forskjellen mellom "produsert pa norske ressurser" og "produsert i Norge" (importert for)
   - Meld. St. 11 (2023-2024): regjeringens mal og definisjoner
   - Norsk selvforsyningsgrad: ~40-50% avhengig av metode

2. Kritikk og debatt:
   - Norges Bondelag (NBS): argumenter for hooyere selvforsyning
   - Okonomers kritikk: komparative fortrinn, handelsliberalisering
   - Beredskapsperspektivet: hva trengs i krise vs. normaltid?
   - Klimaperspektivet: arealbruk, utslipp, protein-skifte

3. Saarbarhetsfaktorer:
   - Importavhengighet: hvilke matvarer er Norge mest avhengig av import for?
   - Logistikk-chokepoints: havner, grenseoverganger, ASKO-sentrallagre
   - Sesongvariasjon i norsk produksjon
   - Gjodsel- og energiavhengighet i landbruket

4. Foreslatte tiltak:
   - Gjenopprettelse av kornlagre
   - Diversifisering av importkilder
   - Styrking av naeringsmiddelindustri
   - Omlegging av arealbruk

Presenter med data, kilder og balansert fremstilling av ulike posisjoner.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Balansert analyse med kvantitative data, debattoversikt og tiltaksliste',
    language: 'no'
  },
  {
    id: 'matsikkerhet-en-frameworks',
    category: 'matsikkerhet',
    title: 'Food security frameworks — FAO, GFSI, EAT-Lancet',
    prompt: `Map the major international food security and food systems frameworks relevant for analyzing the Norwegian food system:

1. FAO Food Security Framework:
   - Four pillars: availability, access, utilization, stability
   - Food Insecurity Experience Scale (FIES) — Nordic data
   - State of Food Security and Nutrition (SOFI) report data for Northern Europe

2. Global Food Security Index (GFSI by Economist Impact):
   - Norway's ranking and scores across all pillars
   - Comparison with other Nordic countries
   - Strengths and weaknesses identified

3. EAT-Lancet Commission:
   - Planetary health diet — implications for Nordic food production
   - Stockholm Resilience Centre's work on food system boundaries
   - How Norway's current diet compares to EAT-Lancet targets

4. OECD-FAO Agricultural Outlook:
   - Norway country profile
   - Producer Support Estimate (PSE) — Norway vs. OECD average
   - Trade balance and projections

5. Other relevant frameworks:
   - HLPE-FSN (High Level Panel of Experts on Food Security)
   - Food Systems Summit 2021 — Nordic commitments
   - SDG 2 (Zero Hunger) progress in Nordic context

For each framework: brief description, key metrics, where to find data, and specific relevance to analyzing a highly concentrated grocery market.`,
    model: 'perplexity',
    expectedOutput: 'Framework comparison with Norwegian data points and analytical applicability',
    language: 'en'
  },
  {
    id: 'matsikkerhet-no-finsk-modell',
    category: 'matsikkerhet',
    title: 'Finsk beredskapsmodell som benchmark',
    prompt: `Analyser den finske matberedskapsmodellen (Huoltovarmuuskeskus / National Emergency Supply Agency) som benchmark for Norge:

1. Organisering:
   - Huoltovarmuuskeskus: mandat, organisering, finansiering (huoltovarmuusmaksu)
   - Huoltovarmuusneuvosto (raad) — sammensetning
   - Sektorkomiteer for matforsyning

2. Strategiske reserver:
   - Hva lagres: korn, fro, gjodsel, drivstoff, medisiner
   - Lagringsvolumer og rotasjonsmekanismer
   - Kostnad og finansieringsmodell

3. Samarbeid med naeringslivet:
   - Pool-systemet: obligatorisk beredskapsplanlegging for bedrifter
   - Oovelser og beredskapsplanlegging
   - Informasjonsdeling mellom myndigheter og naering

4. Erfaringer fra kriser:
   - COVID-19: hvordan systemet responderte
   - Ukraina-krisen: gjodsel- og kornforsyning
   - Evaluering og laerdommer

5. Overforbarhet til Norge:
   - Norge hadde kornlagre til 2003 — hvorfor avviklet?
   - Forskjeller: Norge utenfor EU, annen landbruksstruktur
   - Hva kan Norge laere og adoptere?
   - Politisk debatt om gjeninnforing av beredskapslagre

Inkluder kvantitative data om lagervolumer, kostnader og responstider. Begrunn anbefalinger med finsk erfaring.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Detaljert benchmark-studie med overforingsanalyse og anbefalinger for Norge',
    language: 'no'
  },

  // 8. Matsvinn og sirkulaer okonomi (3)
  {
    id: 'matsvinn-no-data',
    category: 'matsvinn-sirkulaer',
    title: 'Matsvinndata Norge — Matvett og bransjeavtale',
    prompt: `Sammenstill all tilgjengelig data om matsvinn i Norge:

1. Bransjeavtalen om reduksjon av matsvinn (2017-2030):
   - Partene: regjeringen, matbransjen, landbruket
   - Mal: 50% reduksjon innen 2030 (fra 2015-nivaet)
   - Framdrift: arlige rapporteringer, oppnadde resultater

2. Matvett AS (naa del av Norsus):
   - Arlige matsvinnrapporter for Norge
   - Data per ledd: primaerproduksjon, industri, dagligvare, storhusholdning, forbruker
   - Totalt matsvinn i tonn og kg per innbygger
   - Kostnadsestimater

3. NORSUS (tidl. Ostfoldforskning):
   - Forskningsrapporter om matsvinn-malemetodikk
   - Livslopsvurderinger av matsvinn
   - Kategoriseringsdata: hva kastes mest?

4. Matsvinnloven / endringer i matloven:
   - Lovforslag om pliktig rapportering
   - EU-krav (delegert forordning 2019/1597)
   - Norsk implementering og tidsplan

5. Tiltak og resultater:
   - For Mye (TooGoodToGo), Holdbart, reko-ringer
   - Dagligvarekjedenes egne tiltak (datomerking, nedsetting, donasjon)
   - Best practice-eksempler

Presenter tidsserier 2015-2026 der tilgjengelig, med kildehenvisninger.`,
    model: 'gemini-deep-research',
    expectedOutput: 'Datasett med matsvinn-tidsserier, tiltak-oversikt og lovregulering',
    language: 'no'
  },
  {
    id: 'matsvinn-en-circular',
    category: 'matsvinn-sirkulaer',
    title: 'Circular bioeconomy in Nordic food systems',
    prompt: `Review research and policy on circular bioeconomy approaches to food systems in the Nordic countries:

1. Cascading use of biomass:
   - Food waste → animal feed → biogas → fertilizer cascades
   - Nordic research projects on food waste valorization
   - Insect farming from food waste (Nordic pilots)

2. Circular economy strategies:
   - Nordic Council of Ministers circular economy programme
   - National circular economy strategies: Norway (Meld. St. 45), Sweden, Denmark, Finland
   - Specific food system circularity targets and metrics

3. Industrial symbiosis examples:
   - Nordic food industry clusters using waste streams
   - Biogas from food waste: Norwegian and Danish examples
   - Novel proteins and upcycled food ingredients

4. Research programs:
   - Nordic Bioeconomy Programme
   - EU Horizon Europe Cluster 6 projects with Nordic partners
   - EIT Food projects in Nordics

5. Policy instruments:
   - Extended producer responsibility for food packaging
   - Food waste reduction mandates
   - Incentives for circular food businesses

Include quantitative data on food waste reduction, biogas production, and economic value of circular approaches. Identify gaps between policy ambitions and implementation.`,
    model: 'perplexity',
    expectedOutput: 'Overview of Nordic circular food bioeconomy with projects, data, and policy analysis',
    language: 'en'
  },
  {
    id: 'matsvinn-en-measurement',
    category: 'matsvinn-sirkulaer',
    title: 'Food loss measurement methodologies',
    prompt: `Review established and emerging methodologies for measuring food loss and waste (FLW):

1. EU framework:
   - Commission Delegated Decision 2019/1597: mandatory reporting methodology
   - Eurostat food waste data: Nordic country comparison
   - EU Platform on Food Losses and Food Waste

2. FLW Standard (WRI/FAO):
   - Food Loss and Waste Accounting and Reporting Standard
   - Scope definitions: what counts as food loss vs. waste
   - Quantification methods: direct measurement, mass balance, waste composition analysis

3. FAO Food Loss Index:
   - Methodology and data sources
   - Nordic countries' performance

4. National approaches:
   - Norway: Matvett/NORSUS methodology, strengths and limitations
   - UK: WRAP methodology as gold standard
   - Denmark: comprehensive waste statistics
   - Finland: Luke research methodology

5. Challenges and debates:
   - Comparability across countries and methodologies
   - Measuring redistribution vs. prevention
   - Economic vs. environmental vs. nutritional loss metrics
   - Data gaps: farm-level losses, household estimates

Provide a methodology comparison table suitable for choosing the best approach for a Norwegian food system analysis project.`,
    model: 'claude',
    expectedOutput: 'Methodology comparison table with applicability assessment for Norwegian context',
    language: 'en'
  },

  // 9. Logistikk og verdikjede (3)
  {
    id: 'logistikk-no-asko',
    category: 'logistikk-verdikjede',
    title: 'ASKO og norsk dagligvaredistribusjon',
    prompt: `Analyser ASKO (NorgesGruppens grossistvirksomhet) og det norske dagligvaredistribusjonssystemet:

1. ASKO:
   - Organisering: ASKO Norge AS, regionale selskaper
   - Markedsposisjon: andel av norsk dagligvaredistribusjon
   - Lagerstruktur: antall sentrallagre, regionale lagre, lokasjoner
   - Omsetning og volumer
   - Teknologi: automasjon, elektrifisering av transport, hydrogen
   - Baerekraftsmaal og -resultater

2. Andre distributorer:
   - Coop: egen grossistvirksomhet (Coop Norge Handel)
   - Rema: REMA Distribusjon
   - Uavhengige: Servicegrossistene, spesialdistributorer

3. Markedsstruktur:
   - Vertikal integrasjon: kjede → grossist → butikk
   - Konsekvenser for leverandorer og konkurranse
   - Stordriftsfordeler vs. avhengighet

4. Logistikkutfordringer Norge:
   - Geografi: spredt bosetning, lange avstander, vanskelig terreng
   - Sesongvariasjoner og vaer
   - Nordomraadene: spesielle utfordringer
   - Ferjer, tunneler, vegstandard

5. Fremtidstrender:
   - Sentralisering vs. desentralisering av lagre
   - Elektrifisering og utslippsmal
   - Digitalisering og automatisering
   - Droner og autonome kjoretoy — piloter

Inkluder kvantitative data om volumer, kostnader og effektivitet.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Strukturert analyse av distribusjonssystemet med data og trendvurdering',
    language: 'no'
  },
  {
    id: 'logistikk-no-saarbarhet',
    category: 'logistikk-verdikjede',
    title: 'Saarbarhet i norsk matforsyning',
    prompt: `Kartlegg saarbarheter og chokepoints i den norske matforsyningskjeden:

1. Importavhengighet:
   - Hvilke matvarer importerer Norge mest av? (korn, frukt, gronnsaker, sukker, kaffe)
   - Importandeler per kategori
   - Viktigste opprinnelsesland per kategori
   - Handelsveier: sjotransport (havner), landtransport (grenseoverganger)

2. Kritiske chokepoints:
   - Havner: Oslo, Bergen, Stavanger — konsentrasjon og kapasitet
   - Grenseoverganger: Svinesund, Orje — vegtransport fra Sverige
   - Innenlands: ASKO sentrallagre som kritisk infrastruktur
   - Energiforsyning til kjolekjeder

3. Historiske hendelser:
   - COVID-19 forstyrrelser i forsyningskjeden
   - Suezkanalen-blokaden 2021 — effekt pa norsk import
   - Ukraina-krisen — gjodsel og kornpriser
   - Ekstremvaer og infrastrukturbrudd

4. Beredskapsplanlegging:
   - DSB (Direktoratet for samfunnssikkerhet og beredskap) — risikoanalyser
   - Naeringsmiddelberedskap — dagens system og mangler
   - Fylkesberedskapsrad — matforsyningsansvar

5. Scenarioanalyse:
   - Hva skjer ved 2 ukers importstans?
   - Hva om ASKO Oslo-lageret bryter sammen?
   - Sesongbasert saarbarhet (vinter vs. sommer)

Kvantifiser saarbarheter der mulig og foreslaa resiliens-tiltak.`,
    model: 'gemini-deep-research',
    expectedOutput: 'Saarbarhetsanalyse med chokepoint-kart, scenarioer og resiliens-anbefalinger',
    language: 'no'
  },
  {
    id: 'logistikk-en-digital',
    category: 'logistikk-verdikjede',
    title: 'Digital grocery and last-mile in Nordics',
    prompt: `Analyze the digital transformation of grocery retail and last-mile delivery in the Nordic countries:

1. E-commerce grocery market:
   - Market size and penetration rate per Nordic country (2020-2026 trend)
   - Growth trajectory: COVID bump vs. sustained growth
   - Consumer adoption patterns: demographics, urban vs. rural

2. Key players:
   - Oda (Norway): business model, expansion, profitability challenges
   - Mat.se (Sweden), Nemlig.com (Denmark), Wolt Market, Foodora Market
   - Incumbent chains' online offerings: click-and-collect, home delivery
   - Amazon/international entry threat

3. Business models:
   - Dark stores vs. store-picking
   - Automated fulfillment centers (Ocado/AutoStore technology)
   - Quick commerce (q-commerce): Gorillas, Getir — Nordic failures/exits
   - Subscription models

4. Last-mile logistics:
   - Delivery cost economics in low-density Nordic markets
   - Click-and-collect as dominant Nordic model?
   - Autonomous delivery pilots
   - Cold chain challenges

5. Market structure implications:
   - Does e-commerce reduce or increase concentration?
   - Barriers to entry for digital-only players
   - Data advantages for incumbents
   - Regulatory issues: delivery zones, labor conditions

Provide market data, player comparison, and assessment of whether digital grocery disrupts the established oligopoly structure.`,
    model: 'perplexity',
    expectedOutput: 'Market analysis with data tables, player comparison, and structural impact assessment',
    language: 'en'
  },

  // 10. Interessenter og aktoerer (3)
  {
    id: 'interessenter-no-aktorkart',
    category: 'interessenter',
    title: 'Komplett aktoerkart — norsk matsystem',
    prompt: `Lag et komplett aktoerkart over alle relevante organisasjoner og institusjoner i det norske matsystemet:

1. Myndigheter og regulatorer:
   - Landbruks- og matdepartementet (LMD)
   - Naerings- og fiskeridepartementet (NFD)
   - Konkurransetilsynet
   - Dagligvaretilsynet
   - Mattilsynet
   - Omsetningsraadet

2. Bransjeorganisasjoner:
   - Virke Dagligvare
   - DLF (Dagligvareleverandorenes Forening)
   - NHO Mat og Drikke
   - Dagligvarehandelens Miljoforum

3. Produsentorganisasjoner:
   - Norges Bondelag
   - Norsk Bonde- og Smaabrukarlag
   - Nortura (samvirke)
   - TINE (samvirke)

4. Forbruker og sivilsamfunn:
   - Forbrukeraadet
   - Framtiden i vaare hender
   - Naturvernforbundet
   - Spire
   - Utviklingsfondet

5. Forsknings- og kunnskapsmiljoer:
   - NIBIO, NMBU, NHH, SIFO/OsloMet, BI
   - AgriAnalyse
   - Norsk institutt for biooekonomi

6. Tankesmier og raadgivning:
   - Civita, Agenda, Tankesmien Harvest
   - Oslo Economics, Menon, Vista Analyse

For hver aktoer: navn, type, hovedmandat/fokus, kontaktpunkt/nettside, og rolle i dagligvaredebatten. Kategoriser etter posisjon (pro-regulering, pro-marked, naeringsinteresse, kunnskapsprodusent).`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Strukturert aktoerkart med 50+ organisasjoner, kategorisert etter rolle og posisjon',
    language: 'no'
  },
  {
    id: 'interessenter-en-academic',
    category: 'interessenter',
    title: 'Nordic academic groups on food systems',
    prompt: `Map the key academic research groups and centers working on food systems, agricultural economics, and competition policy across the Nordic countries:

1. Norway:
   - NHH FOOD (Centre for Applied Research at NHH): researchers, key publications
   - SIFO (Consumption Research Norway, OsloMet): food research team
   - NIBIO: food system and agricultural economics division
   - NMBU: relevant departments and research groups
   - BI Norwegian Business School: strategy/competition groups
   - UiO Department of Economics: industrial organization group

2. Sweden:
   - SLU (Swedish University of Agricultural Sciences): food system groups
   - Lund University: AgriFood Economics Centre
   - Stockholm Resilience Centre: food systems research
   - Chalmers: food and nutrition science

3. Denmark:
   - Copenhagen Business School (CBS): competition and food groups
   - University of Copenhagen: IFRO (food and resource economics)
   - Aarhus University: MAPP Centre

4. Finland:
   - Luke (Natural Resources Institute Finland)
   - University of Helsinki: agricultural economics
   - Pellervo Economic Research PTT

5. Cross-Nordic:
   - NordForsk-funded networks
   - Nordic Committee for Food Analysis (NMKL)
   - Joint research programs

For each group: name, institution, key researchers (with Google Scholar/ORCID links if possible), main research themes, recent publications on food retail/market concentration, and potential as collaboration partners for a Norwegian food system transition project.`,
    model: 'perplexity',
    expectedOutput: 'Academic network map with 20-30 research groups, key researchers, and collaboration potential',
    language: 'en'
  },
  {
    id: 'interessenter-no-nokkelpersoner',
    category: 'interessenter',
    title: 'Nokkelpersoner i dagligvaredebatten',
    prompt: `Identifiser de viktigste enkeltpersonene i den norske dagligvaredebatten og matpolitikken:

1. Politikere:
   - Geir Pollestad (Sp) — landbruksminister, posisjoner
   - Cecilie Myrseth (Ap) — naeringsminister, dagligvarepolitikk
   - Stortingets naeringskomite — sentrale medlemmer og posisjoner
   - Opposisjonen: Hooyre, SV, MDG — talspersoner pa dagligvare/mat

2. Akademikere og eksperter:
   - Frode Steen (NHH) — dagligvareforskning, Konkurransetilsynets ekspertutvalg
   - Tommy Staahl Gabrielsen (UiB) — konkurranseokonomi, dagligvare
   - Ivar Pettersen (tidl. NILF/NIBIO) — landbruksokonomi
   - Alexander Schjoll (SIFO) — forbrukeratferd dagligvare

3. Naeringslivsledere:
   - Torbjorn Johannson / Knut Hartvig Johannson — NorgesGruppen-eiere
   - Geir Inge Stokke — Coop-sjef
   - Ole Robert Reitan — Reitan Retail
   - Vegard Kjos Nordstad — Dagligvaretilsynet-direktoer

4. Organisasjonsledere:
   - Lars Petter Bartnes / Bjorn Gimming — Bondelaget
   - Bror Stende — DLF
   - Inge Jan Henjesand — relevante roller

5. Medieroster:
   - Journalister som dekker dagligvare fast (DN, E24, NRK)
   - Kronikkoerer og debattanter

For hver person: navn, rolle, organisasjon, hovedposisjoner i dagligvaredebatten (2-3 setninger), og innflytelsesnivaa (hoy/middels/lav).`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Personkatalog med 30-40 nokkelpersoner, posisjoner og innflytelsevurdering',
    language: 'no'
  },

  // 11. Finansiering og virkemidler (3)
  {
    id: 'finans-en-horizon',
    category: 'finansiering',
    title: 'EU/Nordic funding for food system research',
    prompt: `Map all relevant European and Nordic funding opportunities for food system research and transition projects:

1. Horizon Europe Cluster 6 (Food, Bioeconomy, Natural Resources):
   - Open and upcoming calls relevant to food system governance, concentration, resilience
   - Budget envelopes and success rates
   - Nordic participation statistics
   - Relevant funded projects to learn from (SHERPA, FoodSHIFT, etc.)

2. EIT Food:
   - Innovation communities in Nordics
   - Calls for proposals and project types
   - Nordic hub activities

3. Nordic Innovation:
   - Food and bioeconomy programmes
   - Current calls and funded projects
   - Budget levels and eligibility

4. NordForsk:
   - Research programmes on sustainability, food, agriculture
   - Joint Nordic calls
   - Requirements for cross-Nordic collaboration

5. Other sources:
   - JPI FACCE (Agriculture, Food Security and Climate Change)
   - COST Actions on food systems
   - ERA-NET Cofund opportunities
   - EEA/Norway Grants — food-relevant calls in partner countries

For each opportunity: funding body, programme name, budget range, deadline (if known), eligibility requirements, and fit with a project analyzing Nordic food system concentration and transition pathways. Flag opportunities with deadlines in 2026-2027.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Funding matrix with 15-20 opportunities, eligibility, budgets, and deadlines',
    language: 'en'
  },
  {
    id: 'finans-no-forskningsraadet',
    category: 'finansiering',
    title: 'Forskningsraadet og Innovasjon Norge — matrelevant',
    prompt: `Kartlegg alle relevante finansieringsmuligheter fra Forskningsraadet og Innovasjon Norge for matsystem-forskning:

1. Norges forskningsraad:
   - BIONAER-programmet: matrelevante utlysninger, budsjett, prosjekter
   - FFL/JA (Forskningsmidlene for jordbruk og matindustri / Jordbruksavtalen)
   - FORINNPOL (innovasjon og naering)
   - Forskerprosjekt vs. innovasjonsprosjekt vs. kompetanseprosjekt — hva passer?
   - Suksessrate og typiske budsjetter
   - Relevante prosjekter funnet 2020-2026

2. Innovasjon Norge:
   - Baerekraftig matproduksjon — programmer og ordninger
   - Klynge-programmer med mat-relevans (NCE, Arena, GCE)
   - Regionale innovasjonsselskaper med matfokus
   - Mentorstotte og forprosjektmidler

3. Regionale forskningsfond (RFF):
   - Fond med matrelaterte utlysninger
   - Typiske prosjektstorrelser

4. Skattefunn:
   - Relevans for matforskning i bedrifter
   - Kombinasjon med andre virkemidler

5. Siva / katapult-sentre:
   - Manufacturing Technology Norwegian Catapult Centre — matrelevans
   - Andre katapulter med food tech-fokus

For hvert virkemiddel: program, budsjettramme, soknadsfrister, krav til sokere, og vurdering av relevans for Food Systems 2026-prosjektet.`,
    model: 'gemini-deep-research',
    expectedOutput: 'Virkemiddeloversikt med 20+ programmer, budsjetter og relevansvurdering',
    language: 'no'
  },
  {
    id: 'finans-no-nch',
    category: 'finansiering',
    title: 'NCH og Nordic Innovation — tilskuddshistorikk',
    prompt: `Undersook tilskuddshistorikk og naavarende muligheter fra NCH (Nordic Co-operation for Humanitarian action?) og Nordic Innovation for mat- og sirkulaer okonomi-prosjekter:

1. Nordic Innovation:
   - Historiske utlysninger og prosjekter innen mat og sirkulaer okonomi (2018-2026)
   - Nordic Circular Hotspot og relaterte initiativer
   - Typiske prosjektstorrelser og krav
   - Nordiske matinnovasjonsprosjekter som er finansiert

2. Nordisk Ministerraad:
   - Globaliseringsinitiativet — matrelevante prosjekter
   - Nordic Sustainable Food Systems programme
   - Budsjetter og utlysningskalender

3. Andre nordiske kilder:
   - Nordic Energy Research — mat-energi-nexus
   - Nordic Innovation House — nettverk og ressurser
   - Nordisk Atlantsamarbeid (NORA) — matprosjekter

4. Prosjekteksempler:
   - Finn 5-10 prosjekter som ligner Food Systems 2026 i tematikk
   - Budsjetter, partnere, varighet, resultater
   - Laerdommer for soeknadsutforming

5. Praktisk veiledning:
   - Soeknadsprosess steg for steg
   - Krav til nordisk partnerskap
   - Egenfinansiering og medfinansiering
   - Tidslinjer fra soeknad til oppstart

Fokuser pa muligheter som passer et prosjekt som analyserer matsystemkonsentrasjon og overgang til mer resiliente matsystemer i Norden.`,
    model: 'perplexity',
    expectedOutput: 'Tilskuddsoversikt med historikk, aktive muligheter og soeknadsveiledning',
    language: 'no'
  },

  // 12. Mediedebatt og opinion (3)
  {
    id: 'media-no-dekning',
    category: 'mediedebatt',
    title: 'Mediedekning dagligvaremakt 2020-2026',
    prompt: `Kartlegg mediedekningen av dagligvaremakt, matpriser og markedskonsentrasjon i norske medier 2020-2026:

1. Hovedmedier:
   - Aftenposten: ledere, nyhetsartikler, kronikker om dagligvare
   - Dagens Naeringsliv (DN): naeringsperspektiv, bransjeanalyser
   - E24: dagligvarenytt, prissammenligninger
   - NRK: Brennpunkt/Dokumentar om matmakt, nyhetssaker
   - VG: forbrukerjournalistikk, prisjakt

2. Sentrale temaer i dekningen:
   - Matpriser og inflasjon (spesielt 2022-2024)
   - Maktkonsentrasjon og "dagligvareoligopol"-debatten
   - Lov om god handelsskikk — for og etter innforing
   - EMV (egne merkevarer) vs. merkevarer
   - NorgesGruppen-familien og formue
   - Bunnpris-oppkjop og konkurransetilsynet
   - Prisjegeren/prisinformasjon
   - Grensehandel og prisforskjeller

3. Kronikkdebatter:
   - Akademikere vs. bransjerepresentanter
   - Politikere: Sp/Ap vs. Hooyre posisjoner
   - Forbrukerorganisasjoner

4. Sosiale medier og opinion:
   - Twitter/X-debatter om matpriser
   - Forbrukerinitiativer og kampanjer
   - Boikott-initiativer

Lag en tidslinje over de viktigste mediehendelsene, med lenker der mulig. Vurder om mediedekningen har pavirket politiske beslutninger.`,
    model: 'chatgpt-deep-research',
    expectedOutput: 'Medie-tidslinje 2020-2026 med 30-40 nokkelhendelser og tema-analyse',
    language: 'no'
  },
  {
    id: 'media-no-politikk',
    category: 'mediedebatt',
    title: 'Partipolitiske posisjoner — dagligvarepolitikk',
    prompt: `Kartlegg partipolitiske posisjoner pa dagligvare- og matpolitikk i Norge:

1. Regjeringspartiene (2021-2025):
   - Arbeiderpartiet: posisjon pa markedsregulering, dagligvaretilsyn, forbruker
   - Senterpartiet: landbruksvern, selvforsyning, distriktsperspektiv
   - Regjeringsplattformen (Hurdalsplattformen): konkrete lovnader om dagligvare

2. Opposisjonen:
   - Hooyre: markedsliberal tilnaerming, skepsis til regulering
   - Fremskrittspartiet: forbrukerperspektiv, grensehandel, lavere matpriser
   - SV: sterkere regulering, motstand mot maktkonsentrasjon
   - MDG: baerekraft, okologisk mat, matsystemomlegging
   - Venstre: konkurranse og innovasjon
   - Roodt: systemkritikk, kooperativer
   - KrF: forbrukervern, etisk handel

3. Stortingsbehandlinger:
   - Voteringsmonstre pa dagligvarerelaterte saker
   - Anmodningsvedtak om dagligvare
   - Sporretime-sporsmal om matpriser og dagligvare
   - Representantforslag

4. Valgkamp:
   - Dagligvare som valgkamptema 2021 og 2025
   - Partiprogram-formuleringer
   - Skillelinjer: regulering vs. marked, naering vs. forbruker

Presenter som matrise med partier vs. temaer (konsentrasjon, EMV, selvforsyning, prisregulering, etc.).`,
    model: 'perplexity',
    expectedOutput: 'Partimatrise med posisjoner, voteringsdata og politisk dynamikk-analyse',
    language: 'no'
  },
  {
    id: 'media-en-international',
    category: 'mediedebatt',
    title: 'International coverage of Nordic food systems',
    prompt: `Search for international media coverage and policy analysis of Nordic food systems, with focus on market concentration, food policy, and the "Nordic model" for food:

1. International media:
   - The Economist: articles on Nordic grocery markets, food prices
   - Financial Times: Nordic food retail, competition
   - The Guardian: food system governance, Nordic approaches
   - Bloomberg: food industry consolidation

2. International organizations:
   - OECD: Agricultural Policy Monitoring and Evaluation — Norway chapter
   - OECD: Competition assessments of grocery sector
   - World Bank: food system analyses mentioning Nordics
   - FAO: Nordic food security case studies

3. Academic/policy analysis:
   - IPES-Food reports referencing Nordic markets
   - European Commission: internal market reports on food retail
   - BEUC (European Consumer Organisation): food retail competition studies

4. Themes to search:
   - "Norwegian grocery monopoly" or "oligopoly"
   - "Nordic food prices" (Norway consistently ranked as most expensive)
   - "New Nordic Food" movement — international perception
   - "Nordic diet" and health policy
   - Norwegian agricultural subsidies — international criticism/praise

5. Comparative coverage:
   - How Nordic food systems are portrayed vs. other models (US, UK, EU)
   - "Nordic exceptionalism" in food policy discourse

Compile articles with links, publication dates, and key arguments. Assess whether international coverage aligns with or contradicts domestic Norwegian narratives.`,
    model: 'perplexity',
    expectedOutput: 'Curated collection of 20-30 international articles with narrative analysis',
    language: 'en'
  },
]
