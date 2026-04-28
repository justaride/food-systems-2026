---
tittel: "Worker handoff - A-feed source cards"
status: "worker-handoff"
worker: "A-feed"
dato: 2026-04-28
scope:
  - research/bibliotek/akademia/nmbu/foods-of-norway-novel-feed-2024.md
  - research/bibliotek/akademia/internasjonalt/nordic-protein-shift-research-2024.md
  - research/bibliotek/akademia/pubmed/van-der-fels-klerx-hj-2024-framework-for-evaluation-of-food.md
  - research/bibliotek/akademia/pubmed/van-leeuwen-spj-2024-a-novel-approach-to-identify.md
  - research/evidence-pack/forskningsinstitutt/hi-risikorapport-fiskeoppdrett-2025.md
  - research/regulatory/eu-eudr-avskogingsforordningen-2025.md
  - research/norden/verdikjede/04-innsatsvarer.md
canonical_docs_redigert: false
---

# Worker handoff - A-feed source cards

## 1. Scope

- Tildelt batch: A-feed importavhengighet, alternative proteiner, mattrygghet/regulering og oppdrettskontekst.
- Filer/mapper lest:
  - `docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md`
  - `docs/project/mandates/underlagsgjennomgang-food-tg-2026-04-28.md`
  - `docs/project/mandates/track-brief-a-feed-import.md`
  - `docs/project/mandates/claim-register-food-tg.md`
  - `docs/project/mandates/evidence-matrix-food-tg.md`
  - alle syv scoped research-filer.
- Filer ikke funnet: ingen scoped research-filer manglet.
- Arbeidstype: source-card + claim-effekt + valideringsspørsmål.
- Canonical dokumenter redigert: nei.

## 2. Kort konklusjon

1. A-sporet styrkes som hovedspor, men bare hvis det formuleres som importsubstitusjon med valideringsgate, ikke som ferdig volum- eller effektløfte.
2. De sterkeste kildene i batchen er peer-reviewed mattrygghetsartikler, HI-rapporten og EUDR-kilden. De støtter risiko-, compliance- og kontekstrammen bedre enn de beviser konkrete pilotvolumer.
3. Foods of Norway-kilden støtter CL-A-001/002/020 teknisk, men tallene i MD-filen må tilbake til originalartikkel før ekstern bruk. DOI-en i lokalfilen ser ufullstendig ut.
4. `04-innsatsvarer.md` er nyttig intern baseline for aktører, importavhengighet og tallunivers, men må ikke løftes som ekstern evidens uten primærkildesjekk.
5. EUDR bør brukes som compliance-driver for fôr- og soyasporet, men norsk/EØS-innlemmelse nyanserer claimet: soya er etter norske myndigheters posisjon ikke innlemmet i EØS-gjennomføring per høringsstatus, mens EU-markedseksponering fortsatt kan være relevant.
6. Det finnes et viktig tallflagg: NMBU-notatet sier norsk lakseoppdrett bruker ca. 500 000 tonn soya årlig, mens `04-innsatsvarer.md` omtaler ca. 500 000 tonn norsk soyaimport/soyamel og Denofa-import/prosessering. Master bør ikke bruke dette som laksefôrvolum før primærkilde er låst.

## 3. Source cards / triage rows

### SRC-A-001 - Novel Microbial Protein Feed Ingredients for Sustainable Salmon Aquaculture

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/nmbu/foods-of-norway-novel-feed-2024.md` |
| Arkivlag | L1-kandidat, men lokal MD er bare source-notat |
| Spor | A-feed |
| Kildetype | akademisk primærkilde oppsummert i lokalt notat |
| Relevansscore | 5 |
| Evidensscore | 4 nå, 5 etter originalartikkel/DOI-sjekk |
| Siterbarhet | Medium nå; Høy etter originalartikkel, DOI og tallkontroll |
| Status | needs-primary-check |
| Neste handling | Finn originalartikkel/PDF, DOI, forsøksoppsett, kontrollgruppe, prosentbasis og LCA-/klimaestimat før ekstern bruk. |

#### Beslutningsfunn

1. Kilden støtter at metanotroft bakterieprotein kan erstatte en betydelig andel soyaproteinkonsentrat i forsøksfôr til atlantisk laks uten rapporterte negative produksjons-/helseeffekter i forsøket.
2. Kilden støtter at gjærprotein fra norsk biomasse er et FoU-spor for fôrprotein.
3. Kilden støtter pilotretningen som teknisk scoping, ikke kommersiell skala, volum, kost eller regulatorisk aksept.

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-A-001 | styrker, men nyanserer | Støtter teknisk mulighet. Må ikke tolkes som markedsmodenhet eller generell erstatning av soya i norsk laksefôr. |
| CL-A-002 | styrker | Underbygger gjær-/encelleprotein som relevant FoU-spor. |
| CL-A-020 | styrker, men nyanserer | Støtter pilot som scopingpilot; svekker enhver formulering som lover volum, kostreduksjon eller LCA-effekt uten ekstra dokumentasjon. |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Tall | Opptil 40 % erstatning av soyaproteinkonsentrat i forsøket. | Kan brukes internt nå; ekstern bruk krever originalartikkel og kontekst for prosentbasis. |
| Tall | Ca. 500 000 tonn soya årlig i norsk lakseoppdrett oppgis i lokalt notat. | Ikke bruk eksternt før primærkilde; mulig konflikt med `04-innsatsvarer.md`. |
| Tall | Lokalt produsert mikrobielt protein kan redusere karbonavtrykk 30-50 % oppgis i notatet. | Må LCA- og systemgrensesjekkes. |
| Aktør | NMBU/Foods of Norway, Mowi, Cargill. | Aktørspørsmål om modenhet, kost, LCA og regulatorisk vei. |
| KPI | Andel soyaproteinkonsentrat erstattet i forsøksfôr; FCR/vekst/helse. | Pilotdesign bør bruke disse som tekniske KPI-er, ikke samfunnseffekt-KPI-er. |
| Sitat/side | Ikke kontrollert. | Krever PDF/original. |

#### Usikkerhet

- DOI i lokalfilen er ufullstendig: `https://doi.org/10.1016/j.aquaculture.2024`.
- Tall om soya, klimaeffekt og industripartnere er ikke dokumentert med sidetall eller originaltabell i MD-filen.
- "Norsk lakseoppdrett bruker ~500 000 tonn soya årlig" kan være feil scoped eller blande total soyaimport/soyamel med akvakulturspesifikt volum.

#### Valideringsspørsmål

- Hvilken fôringrediens erstattes presist: soyaproteinkonsentrat, soyamel eller annen soyaråvare?
- Hva er forsøksvarighet, fiskestørrelse, fôrformulering, kontrollfôr og statistisk usikkerhet?
- Finnes oppdatert LCA for metanotroft bakterieprotein og gjærprotein under norsk energimiks?
- Hvilke regulatoriske krav gjelder for denne produksjonsruten i fôr til laks?

### SRC-A-002 - Nordic Alternative Protein Research Ecosystem

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/internasjonalt/nordic-protein-shift-research-2024.md` |
| Arkivlag | L2 |
| Spor | A-feed, finance, ecosystem |
| Kildetype | sekundær rapport / interesseorganisasjon |
| Relevansscore | 4 |
| Evidensscore | 3-4 |
| Siterbarhet | Medium |
| Status | source-card |
| Neste handling | Bruk til økosystem- og finansieringskontekst; kryssjekk investerings- og finansieringstall mot GFI-rapporten og programkilder. |

#### Beslutningsfunn

1. GFI-kilden støtter at Norden har et relevant alternativ-proteinøkosystem, særlig rundt forskning, finansiering og nettverk.
2. Danmark fremstår sterkere enn Norge i kilden, særlig gjennom offentlig strategi og fondsmidler.
3. Kilden er nyttig for finansierings- og posisjoneringslogikk, men er ikke uavhengig effektbevis for norske piloter.

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-A-003 | styrker, men nyanserer | Støtter nordisk/DK tyngdepunkt og svakere norsk posisjon, men bør merkes som sekundær interesseaktørkilde. |
| CL-A-020 | nyanserer | Viser økosystemmulighet for encelle-/fermenteringsspor, men ikke at en norsk laksefôrpilot er moden. |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Tall | Nordiske land omtales som 4 av topp 10 europeiske finansiører og rundt en femtedel av investeringene 2020-2024. | Finansieringsargument; sjekk rapporttabell før ekstern bruk. |
| Tall | Danmark: 96 mill. EUR; Novo Nordisk Fonden: 67+ mill. EUR. | Benchmark for fundingkapasitet. |
| Case | Danmark nasjonal handlingsplan for plantebasert mat 2023. | C-/finance-kobling, ikke direkte fôrcase. |
| Aktør | GFI Europe, Novo Nordisk Fonden, NAPKIN. | Mulige kunnskaps-/finansieringsnoder. |
| KPI | FoU-/finansieringsvolum per land; antall relevante nettverk/programmer. | Roadmap-/funding-scan. |
| Sitat/side | Ikke kontrollert. | Krever original web/rapportuttrekk. |

#### Usikkerhet

- GFI er en sektorfremmende aktør; bruk som økosystemkart, ikke nøytralt markedsbevis.
- Tall kan være metodeavhengige og oppdatert etter 2024.

#### Valideringsspørsmål

- Hvilke aktive nordiske programmer i 2026 kan faktisk finansiere A-feed-scoping?
- Har Norge nyere tiltak/investeringer som gjør "ligger etter" mindre presist?
- Er finansieringen relevant for fôringredienser til akvakultur eller primært plantebasert mat/dyrket kjøtt?

### SRC-A-003 - Framework for evaluation of food safety in the circular food system

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/pubmed/van-der-fels-klerx-hj-2024-framework-for-evaluation-of-food.md` |
| Arkivlag | L1 |
| Spor | A-feed, B-sidestream, policy |
| Kildetype | fagfellevurdert metode-/perspektivartikkel |
| Relevansscore | 5 |
| Evidensscore | 4 |
| Siterbarhet | Høy |
| Status | source-card |
| Neste handling | Bruk som risikodesign-kilde; sjekk PDF for nøyaktige formuleringer, figurer og eventuelle sidetall. |

#### Beslutningsfunn

1. Gir et HACCP-inspirert trestegs rammeverk for å identifisere og prioritere mattrygghetsfarer i sirkulære matsystemer.
2. Insektoppdrett på sidestrømmer er eksplisitt relevant case, med kjemiske og mikrobiologiske farer fra substrat til biomasse.
3. Kilden gjør mattrygghetsdesign til et tidlig pilotkrav, ikke en etterkontroll.

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-A-005 | styrker | Direkte støtte for casevis, HACCP-lignende risikovurdering. |
| CL-A-021 | styrker, men nyanserer | Støtter insektproteinpilot bare som risikostyrt design med substratspesifikk vurdering. |
| CL-A-011 | indirekte nyanserer | Bekrefter behov for regel-/risikoavklaring, men verifiserer ikke TSE/ABP juridisk detalj. |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Case | Sidestrømmer til insektoppdrett. | Risikofilter for A2/CL-A-021. |
| Regulering | HACCP-lignende risikoramme før skalering. | Minimumskrav i pilotbrief og Mattilsynet-spørsmål. |
| KPI | Fareidentifikasjon, prioritering, overføringsrisiko fra substrat til biomasse, case-spesifikke akseptkriterier. | Pilotgate. |
| Sitat/side | Ikke kontrollert. | Krever PDF-verifisering. |

#### Usikkerhet

- Kilden demonstrerer rammeverk, ikke full nordisk risikovurdering.
- Caseprioriteringer kan endres med lokale substrater, prosessering, hygienisering og regelverk.

#### Valideringsspørsmål

- Hvilke substrater i Norden kan vurderes med dette rammeverket i 2026?
- Hvilke farer må måles før fôr-/insektpilot kan gå videre?
- Hvem eier risikovurderingen: Mattilsynet, produsent, forskningspartner eller fôrkjøper?

### SRC-A-004 - A novel approach to identify critical knowledge gaps for food safety in circular food systems

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/pubmed/van-leeuwen-spj-2024-a-novel-approach-to-identify.md` |
| Arkivlag | L1 |
| Spor | A-feed, B-sidestream, policy |
| Kildetype | fagfellevurdert metode-/perspektivartikkel |
| Relevansscore | 5 |
| Evidensscore | 4 |
| Siterbarhet | Høy |
| Status | source-card |
| Neste handling | Bruk som gap-sjekkliste; PDF-sjekk før sitatbruk. |

#### Beslutningsfunn

1. Kilden identifiserer kunnskapshull for tidligere matvarer/swill til dyrefôr og avløpsbaserte ressurser.
2. Sentrale huller er ukjente farer/blandinger, forekomstdata, skjebne i systemet, risikoestimater og safe-by-design.
3. For swill-caset fremheves kildesortering og separasjon av høy-/lavrisikostrømmer som styringsbehov.

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-A-006 | styrker | Direkte støtte for at swill/tidligere matvarer bare er relevant hvis farer, forekomstdata og risikomodeller dokumenteres bedre. |
| CL-A-021 | nyanserer | Svekker alle brede formuleringer om "sidestrømmer til fôr" uten safe-by-design og separasjon av risiko. |
| CL-A-011 | indirekte nyanserer | Bekrefter EU/BSE/fôrregelverkskontekst, men erstatter ikke juridisk primærsjekk. |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Case | Tidligere matvarer/swill til dyrefôr. | Valideringsspørsmål for Mattilsynet og FoU. |
| Case | Reclaimed water / avløpsprodukter i landbruk. | Krysskobling til B-spor, men ikke primært A-feed. |
| Regulering | Safe-by-design, bedre overvåking og on-site kontroll. | Designkrav i pilotgate. |
| KPI | Antall identifiserte farer, forekomstdata, skjebnedata, risikomodell-kvalitet, sorterings-/separasjonsgrad. | Mattrygghets- og datakrav. |
| Sitat/side | Ikke kontrollert. | Krever PDF-verifisering. |

#### Usikkerhet

- Artikkelen fyller ikke kunnskapshullene med empiriske data.
- Kan ikke brukes til å si at en konkret sidestrøm er trygg eller utrygg.

#### Valideringsspørsmål

- Hvilke "tidligere matvarer" er lovlige og realistiske i norsk/nordisk fôr i dag?
- Hvilke datakrav kreves for å skille høy- og lavrisikostrømmer i drift?
- Er on-site testing praktisk mulig for aktuelle aktører?

### SRC-A-005 - Risikorapport norsk fiskeoppdrett 2025

| Felt | Verdi |
|---|---|
| Filsti | `research/evidence-pack/forskningsinstitutt/hi-risikorapport-fiskeoppdrett-2025.md` |
| Arkivlag | L1 |
| Spor | A-feed, baseline |
| Kildetype | primær fag-/myndighetsnær rapport |
| Relevansscore | 4 |
| Evidensscore | 5 for oppdrettskontekst; 2 for direkte fôrclaim |
| Siterbarhet | Høy |
| Status | source-card |
| Neste handling | Bruk som kontekst for at fôrinnovasjon må settes inn i oppdrettsrisiko/velferd; ikke bruk som effektbevis for alternative fôringredienser. |

#### Beslutningsfunn

1. Norsk oppdrett er stor nok til at fôrspor har høy systemrelevans.
2. Rapporten viser betydelige risiko- og velferdsutfordringer i oppdrett som ikke løses av fôrråvarebytte alene.
3. Kilden bør brukes til å begrense for sterke bærekraftsclaims om alternative ingredienser.

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-A-020 | nyanserer | Pilot må vise hvordan fôrinnovasjon passer inn i bred oppdrettsrisiko, ikke bare importsubstitusjon. |
| Ny claim-kandidat | ny claim | "Fôrinnovasjon i lakseoppdrett må vurderes opp mot bredere velferds-, sykdoms-, miljø- og kjemikalierisiko; alternative ingredienser er ikke i seg selv dokumentasjon på bedre samlet oppdrettsrisiko." |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Tall | Total lakseksport 2024: 1 251 000 tonn / 122,58 mrd. NOK. | Systemrelevans for A-feed. |
| Tall | Total produksjon over 1,65 mill. tonn; gjennomsnittlig månedlig stående biomasse 458 mill. laks. | Baseline for oppdrettsskala. |
| Tall | 60 mill. laks døde/kassert i 2024; produksjonsdødelighet ca. 16 %, myndighetsmål under 5 %. | Velferds-/risikokontekst, ikke fôreffekt. |
| Tall | Kobberbruk 306 tonn i 2023, 82 % ned fra 2019-toppen; tralopyril 116 tonn i 2023. | Miljøkontekst. |
| KPI | Dødelighet per kohort, velferdsrisiko per produksjonsområde, luseutslipp, rømming/genetisk innkrysning, kjemikaliebruk. | Bør være kontekst-KPI-er hvis laksefôrpilot kommuniseres eksternt. |
| Sitat/side | Ikke kontrollert. | Nett-URL finnes; eksakt sitat bør kontrolleres mot HI-nettrapport. |

#### Usikkerhet

- Rapporten sier ikke at alternative fôringredienser reduserer dødelighet, lusepress eller kjemikaliebruk.
- Tallene bør sjekkes mot HI-nettrapportens tabeller hvis de brukes eksternt.

#### Valideringsspørsmål

- Hvilke oppdrettsrisikoer påvirkes faktisk av fôringrediensvalg?
- Bør en A-feed pilot ha dyrevelferds- og fiskehelseparametere som minimumskrav?
- Hvilke sjømataktører kan bekrefte hvilke fôr-KPI-er de faktisk måler?

### SRC-C-007 - EU Avskogingsforordning (EUDR)

| Felt | Verdi |
|---|---|
| Filsti | `research/regulatory/eu-eudr-avskogingsforordningen-2025.md` |
| Arkivlag | L1 for EU-regelverk; norsk implementering krever egen primærsjekk |
| Spor | A-feed, C-adoption, policy |
| Kildetype | regulering / lokal regulatorisk source-note |
| Relevansscore | 5 |
| Evidensscore | 5 for EU-frister/commodities; 3 for norsk praktisk konsekvens |
| Siterbarhet | Høy for EU-kildene; Medium for lokal tolkning av norsk konsekvens |
| Status | needs-primary-check |
| Neste handling | Bruk EUDR som compliance-driver, men juridisk sjekk norsk/EØS-implementering, soya-unntak og TRACES/Denofa-problem før sterke Norge-claims. |

#### Beslutningsfunn

1. EUDR gjør soya/fôrråvarer til sporbarhets- og compliance-spørsmål i EU-markedet.
2. Per offisiell EU-status er hovedfristene etter endring: store/mellomstore aktører 30. desember 2026, mikro/små 30. juni 2027.
3. Norske myndigheter har besluttet å innlemme EUDR i EØS så langt Norge er forpliktet, men oppgir at soya ikke innlemmes i den norske EØS-gjennomføringen og må vurderes gjennom nasjonale regler.
4. Dette nyanserer CL-C-011 og A-feed-koblingen: EU-soya er en sterk compliance-driver, men norsk soyaimport må ikke beskrives som direkte EØS-pliktig uten juridisk presisering.

#### Regulatory spot-check 2026-04-28

- European Commission EUDR-siden bekrefter at EUDR ble endret i desember 2024 og desember 2025, og oppgir anvendelsesdatoer 30.12.2026 for large/medium operators og 30.06.2027 for micro/small operators.
- EUR-Lex for Regulation (EU) 2025/2650 bekrefter ny artikkel 38 og forenklet anvendelsesdato.
- Regjeringen.no-sak 09.01.2026 om høring bekrefter norsk høringsstatus og at soya ikke innlemmes i norsk EØS-gjennomføring etter regjeringens posisjon.
- Relevante primærlenker:
  - https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en
  - https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32025R2650
  - https://www.regjeringen.no/no/dokumenter/horing-endringer-i-avskogingsforordningen/id3145388/
  - https://www.regjeringen.no/no/aktuelt/horing-om-avskogingsforordningen-kort-frist/id3145726/

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-C-011 | styrker, men nyanserer | Støtter at soya/fôrråvarer er compliance- og sporbarhetstema i EU. Norsk EØS-gjennomføring gjør formuleringen mer kompleks for Norge. |
| CL-A-020 | nyanserer | EUDR kan være driver for importsubstitusjon og sporbarhet, men støtter ikke teknisk modenhet eller pilotvolum. |
| Ny claim-kandidat | ny claim | "For norske fôrråvarer og soya bør EUDR omtales som EU-markeds- og sporbarhetsdriver, mens norsk rettslig plikt for soya må sjekkes særskilt fordi regjeringen per høringsstatus holder soya utenfor EØS-innlemmelsen." |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Regulering | EUDR omfatter storfe, kakao, kaffe, palmeolje, gummi, soya og tre. | Policybaseline. |
| Regulering | Produkter må dokumenteres avskogingsfrie etter 31.12.2020 og lovlig produsert. | Compliance-/sporbarhetsclaim. |
| Regulering | Store/mellomstore aktører: 30.12.2026; mikro/små: 30.06.2027. | Roadmap-tidslinje. |
| Regulering | Geolokalisering og aktsomhetserklæring/informasjonssystem. | Datakrav for import- og fôrkjeder. |
| Case | Denofa/TRACES-problematikk omtales i lokal source-note. | Må juridisk/aktørvalideres før bruk. |
| KPI | Andel råvarer med geolokalisert opprinnelse, DD-statement-dekning, leverandørsporbarhet, EUDR-risikonivå per råvare. | C/A-data- og compliance-KPI. |
| Sitat/side | Ikke kontrollert i lokal fil; offisielle URL-er kontrollert 2026-04-28. | Bruk offisielle lenker, ikke intern source-note, ved ekstern publisering. |

#### Usikkerhet

- Lokal source-note skriver "Norge inkorporerer EUDR i EØS, men ekskluderer storfekjøtt og soya"; dette støttes av Regjeringen.no, men rettslig status er "under behandling" og må oppdateres etter høring/proposisjon.
- Denofa/TRACES-problemet er beslutningsrelevant, men bør bekreftes mot Denofa, myndighet eller juridisk notat.
- EU-kommisjonens forenklingsrapport skulle foreligge innen 30.04.2026; per 28.04.2026 bør master planlegge ny sjekk etter fristen.

#### Valideringsspørsmål

- Hva er gjeldende norsk rettsstatus for EUDR per dato for Insight Pack?
- Hvordan påvirkes norske soyaimportører som eksporterer videre til EU/EØS-kunder hvis soya ikke innlemmes i norsk EØS-gjennomføring?
- Hvilke TRACES-roller kan norske aktører faktisk få?
- Hvordan påvirkes fôrprodusenter gjennom kundekrav selv om direkte rettsplikt er uklar?

### SRC-A-006 - Innsatsvarer og oppstrøms verdikjeder i nordisk landbruk

| Felt | Verdi |
|---|---|
| Filsti | `research/norden/verdikjede/04-innsatsvarer.md` |
| Arkivlag | L3 |
| Spor | A-feed, baseline, actor |
| Kildetype | intern syntese / forskningsutkast |
| Relevansscore | 5 |
| Evidensscore | 2 |
| Siterbarhet | Lav eksternt; Medium internt |
| Status | needs-primary-check |
| Neste handling | Bruk som navigasjon og tall-/aktørkø. Primærkildesjekk alle konkrete tall før matrix/Insight Pack. |

#### Beslutningsfunn

1. Kilden gir best samlet intern oversikt over nordiske fôraktører, soya/proteinavhengighet, Denofa, fiskefôr, gjødsel og andre kritiske innsatsvarer.
2. Den støtter at fôr og proteiner bør behandles som import- og beredskapstema, ikke bare innovasjon.
3. Kilden inneholder mange operative tall og aktørpåstander, men må behandles som forskningsutkast med primærkildekø.

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-A-020 | styrker, men med lav evidens | Gir importavhengighets- og aktørlogikk for fôr/pilot. Tall må sjekkes. |
| CL-C-011 | nyanserer | Kobler soya til Denofa, sertifisering og importavhengighet; EUDR-rettslig status må ikke avledes fra denne kilden alene. |
| Ny claim-kandidat | ny claim | "Nordisk fôrberedskap er konsentrert rundt få kooperative og industrielle noder, og sårbarheten handler både om råvareimport, prosessering, sertifisering, energi og logistikk." |
| Ny claim-kandidat | ny claim | "Sertifisert/avskogingsfri soya reduserer bærekraftsrisiko, men fjerner ikke import-, klima-, logistikk- eller compliance-sårbarhet." |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Tall | Felleskjøpet Agri ca. 900 000 t kraftfôr/år, ca. 50 % markedsandel, ca. 36 000 bønder, omsetning 21,2 mrd. NOK 2024. | Aktør- og baseline-kø; må primærkildesjekkes. |
| Tall | FKRA Stavanger ca. 370 000 t/år; Lantmännen ca. 1,3 mill. t fôr/år; DLG 3,9 mill. t fôr 2021; Hankkija 500 000 t/år. | Nordisk aktørkart; må sjekkes. |
| Tall | Norge ca. 500 000 t soyamel/import årlig; Danmark 1,2-1,7 mill. t soyamel; Denofa import ca. 450 000 t soyabønner og prosessering til ca. 330 000 t soyamel. | Importavhengighet; må låses mot Denofa/IDH/handelsdata. |
| Tall | Norge kjøper 17 % av all bærekraftig sertifisert soya globalt, med 0,2 % av globale volumer. | Sterkt kommunikasjonsfunn hvis primærkilde finnes; ikke bruk ennå. |
| Tall | Skretting ca. 2,5 mill. t fôr 2024 globalt; BioMar Norge ca. 600 000 t kapasitet. | Fôrindustri-kart; sjekk. |
| Tall | "Nesten 2 mill. metriske tonn villfisk årlig for å fôre norsk oppdrettslaks." | Rødt flagg; høy risiko for feilkontekst, må sjekkes mot IFFO/FAO/industridata. |
| Case | Denofa som nordisk soyaprosesseringsnode. | Aktørintervju og EUDR-/sporbarhetscase. |
| Case | Felleskjøpet, Lantmännen, DLG, Hankkija som nordiske fôr-/landbruksnoder. | Demand-side/intervjushortlist. |
| KPI | Importandel proteinråvarer, sertifiseringsdekning, fôrråvareopprinnelse, konsentrasjon i prosessering, beredskapslager, andel lokale proteinvekster. | Roadmap-/baseline-KPI-er etter datasjekk. |
| Sitat/side | Ikke relevant; intern syntese. | Ikke siter eksternt. |

#### Usikkerhet

- Dokumentet har kildeliste, men ikke fotnoter per tall. Primærkilder må spores.
- Flere tall gjelder ulike måleenheter: soyabønner, soyamel, soyaproteinkonsentrat, kraftfôr og akvakulturfôr må ikke blandes.
- "Avskogingsfri" og "sertifisert" må skilles fra EUDR-compliant, geolokalisert og rettslig dokumentert.

#### Valideringsspørsmål

- Hvilke tall er soyabønner, soyamel, soyaproteinkonsentrat eller total fôrprotein?
- Hvor mye soya går faktisk til norsk laksefôr vs. husdyrfôr og videre distribusjon i Norden?
- Hvilke fôrråvarer er mest realistiske for importsubstitusjon i Norge: proteinvekster, encelleprotein, gjær, insekter, marine sidestrømmer eller prosessbasert reduksjon?
- Hvilke aktører kan gi data raskest: Denofa, Felleskjøpet, Skretting, BioMar, Cargill, Mowi, NMBU?

## 4. A-claims som styrkes/svekkes/nyanseres

| Claim | Effekt | Worker-vurdering |
|---|---|---|
| CL-A-001 | styrker, men tall må sjekkes | NMBU-kilden støtter teknisk erstatning i forsøk. Ikke citation-ready for 40 %, soya-volum eller klimaeffekt før originalartikkel. |
| CL-A-002 | styrker | Gjær-/encelleprotein er tydelig relevant FoU-spor. Må fortsatt avgrenses mot kost, LCA, råvaretilgang og regulatorikk. |
| CL-A-003 | styrker, men nyanserer | GFI støtter nordisk økosystemclaim, særlig Danmark/fond. Kilden er sekundær interesseaktør og bør ikke alene bære norsk posisjoneringsclaim. |
| CL-A-005 | styrker | van der Fels-Klerx et al. gir sterk støtte til casevis HACCP-lignende risikovurdering for sirkulære fôrruter/insekter. |
| CL-A-006 | styrker | van Leeuwen et al. gir sterk støtte til kunnskapshull for swill/tidligere matvarer og avløpsbaserte ressurser. |
| CL-A-011 | nyanserer, ikke full verifikasjon | Scoped fagartikler støtter at regel-/sikkerhetsavklaring er kritisk, men TSE/ABP/kategori 3-detaljer må fortsatt primær-juridisk sjekkes. |
| CL-A-013 | ikke egnet fra dette scope | Volare/Finnprotein-kilden var ikke i scope. Ingen styrking herfra. |
| CL-A-020 | styrker, men avgrenser | Teknisk og økosystemmessig relevant, og EUDR/compliance gir ekstra driver. Må formuleres som scopingpilot, ikke volum-/effektpilot. |
| CL-A-021 | styrker, men risikoskjerper | Mattrygghetsartiklene styrker pilotlogikken bare hvis substratvalg, risiko, data og kjøperkrav er designet først. |
| CL-A-022 | ikke egnet fra dette scope | Axfoundation var ikke i scope. |
| CL-C-011 | styrker, men juridisk nyanserer | EUDR gjør soya til EU-compliance-/sporbarhetstema, men norsk EØS-innlemmelse holder soya utenfor per regjeringens posisjon. |

### Nye eller ryddes som legacy

| Kandidat | Type | Begrunnelse |
|---|---|---|
| Ny A/baseline claim om oppdrettsrisiko | ny claim | HI-kilden viser at fôrinnovasjon må settes i bredere oppdrettsrisiko/velferdskontekst. |
| Ny A/C claim om EUDR/Norge | ny claim | Det trengs presis formulering som skiller EU-markedsdriver fra norsk EØS-plikt for soya. |
| Ny A/baseline claim om sertifisert soya | ny claim | Sertifisert/avskogingsfri soya reduserer bærekraftsrisiko, men ikke import- og logistikkrisiko. |
| CL-A-007/008/009/010/014/015/016/017 i matrix | rydd legacy | Disse forekommer i evidence matrix, men ikke i claim-registeret. Master bør enten opprette dem formelt eller fjerne/erstatte med eksisterende CL-IDer. |

## 5. Tall / case / regulering / KPI

### Tall som kan brukes internt nå

| Tall | Kilde | Bruk | Status |
|---|---|---|---|
| Opptil 40 % erstatning av soyaproteinkonsentrat i forsøk | SRC-A-001 | Teknisk mulighet | Må originalartikkelsjekkes |
| Danmark 96 mill. EUR; Novo Nordisk Fonden 67+ mill. EUR | SRC-A-002 | Finansierings-/økosystembenchmark | Må rapporttabellsjekkes |
| 60 mill. laks døde/kassert i 2024, ca. 16 % produksjonsdødelighet | SRC-A-005 | Oppdrettsrisiko/velferdskontekst | HI primærkilde, sjekk nettrapport ved ekstern bruk |
| Store/mellomstore EUDR-frist 30.12.2026; mikro/små 30.06.2027 | SRC-C-007 + EU spot-check | Roadmap/compliance-tidslinje | Kan integreres med offisiell EU-lenke |
| Denofa ca. 450 000 t soyabønner, ca. 330 000 t soyamel | SRC-A-006 | Aktør-/importbaseline | Må primærkildesjekkes |

### Case

| Case | Bruk | Status |
|---|---|---|
| Foods of Norway/NMBU mikrobielt protein | A1 scopingpilot | Integrer som teknisk case med tallforbehold |
| Insektoppdrett på sidestrømmer | A2 risikodesign | Integrer som risiko-/designcase, ikke volumcase |
| HI norsk oppdrettsrisiko | Baseline/kontekst | Integrer som begrensende kontekst |
| Denofa/TRACES/EUDR | Compliance-/sporbarhetscase | Må sjekkes juridisk og med aktør |
| Felleskjøpet/Skretting/BioMar/Cargill/Mowi | Aktørdialog | Bruk som intervjukø, ikke evidens uten primærdata |

### Regulering

| Regulering | Hva den gir | Status |
|---|---|---|
| EUDR | Soya som sporbarhets-/due-diligence-tema i EU, geolokalisering og frister | Integrer med presis norsk forbehold |
| TSE/ABP/kategori 3 | Mulig flaskehals for animalske/sirkulære substrater | Ikke validert i dette scope; må juridisk sjekkes |
| HACCP/safe-by-design | Risikoramme for sirkulært fôr/insekt/swill | Integrer som designkrav |

### KPI-kandidater

| KPI | Hvorfor | Status |
|---|---|---|
| Andel soyaproteinkonsentrat erstattet i forsøksfôr | Teknisk pilot-KPI | Bruk etter originalartikkelsjekk |
| FCR, vekst, helse/velferd i fôrtest | Skiller teknisk mulighet fra risiko | Integrer som pilotkrav |
| Andel råvare med dokumentert opprinnelse/geolokasjon | EUDR-/sporbarhets-KPI | Integrer for compliance-spor |
| Importandel proteinråvarer og andel sertifisert/avskogingsfri soya | Baseline/beredskap | Må datalåses |
| Substratspesifikk fareidentifikasjon og forekomstdata | Mattrygghet | Integrer som gate for A2 |
| Oppdrettsdødelighet/velferdsrisiko som kontekst-KPI | Hindrer overclaiming | Integrer som ramme, ikke fôreffekt |

## 6. Usikkerhet og valideringsspørsmål

### Usikkerhet

- NMBU/Foods of Norway-notatet har ufullstendig DOI og ingen sidetall/tabeller.
- Soya-tallene blander trolig total norsk/nordisk soyaimport, soyamel og akvakulturspesifikk bruk; må ryddes før ekstern tekst.
- Klimaeffekt 30-50 % for mikrobielt protein mangler systemgrenser og LCA-kilde i lokalfilen.
- GFI-tall er nyttige, men kommer fra en aktør med tydelig sektoragenda.
- `04-innsatsvarer.md` er rikt, men er et forskningsutkast med samlekildeliste og mange tall uten linjenær kilde.
- EUDR norsk implementering er i bevegelse; soya er holdt utenfor norsk EØS-innlemmelse per Regjeringen.no, men EU-markedseksponering og kundekrav kan likevel gjøre den praktisk relevant.
- HI-rapporten dokumenterer oppdrettsrisiko, ikke fôringrediensers effekt på disse risikoene.
- Mattrygghetsartiklene støtter risikodesign, men ikke konkrete lovlige substrater.

### Valideringsspørsmål

1. Hva er korrekt norsk/nordisk volum for soyabønner, soyamel, soyaproteinkonsentrat og akvakulturspesifikk soya?
2. Hva er riktig originalkilde og DOI for Foods of Norway-studien, og hva sier den faktisk om 40 % erstatning?
3. Hvilke LCA-resultater finnes for metanotroft bakterieprotein og gjærprotein under norsk/nordisk energimiks?
4. Hvilke fôrråvarer er mest realistiske å validere i 2026: encelleprotein/gjær, insekter, proteinvekster eller marine sidestrømmer?
5. Hvilke substrater er lovlige for insekt-/fôrproduksjon under gjeldende TSE/ABP/fôrregelverk?
6. Hvordan påvirkes norske soyaimportører av EUDR hvis soya holdes utenfor EØS-innlemmelsen, men EU-kunder krever EUDR-dokumentasjon?
7. Kan Denofa, Felleskjøpet, Skretting, BioMar, Cargill eller Mowi gi fôrråvaredata på nivået TG trenger?
8. Bør dyrevelferd/fiskehelse inngå som minimums-KPI i A-feed-pilot, eller bare som kontekst?

## 7. Integrer nå vs. må sjekkes først

### Master kan integrere nå

| Funn | Hvor |
|---|---|
| A-sporet styrkes som hovedspor med valideringsgate, ikke som volum-/effektløfte. | Sporbrief A / decision memo |
| CL-A-005 og CL-A-006 har sterk faglig støtte for casevis mattrygghet, HACCP/safe-by-design og kunnskapshull. | Claim-register/evidence-matrix |
| CL-A-020 bør formuleres som teknisk/regulatorisk scopingpilot for encelle-/gjærprotein. | Track brief A |
| CL-A-021 bør risikoskjerpes: insektproteinpilot bare på godkjente, dokumenterte substrater med Mattilsynet-/aktørgate. | Track brief A/B |
| HI-rapporten bør inn som kontekst: fôrinnovasjon må ikke kommuniseres som samlet oppdrettsrisikoløsning. | Insight Pack / A-brief |
| EUDR bør inn som compliance-/sporbarhetsdriver med EU-frister 30.12.2026 og 30.06.2027. | C/A-krysslink / roadmap |
| `04-innsatsvarer.md` kan brukes som intern aktør- og tallkø. | Master backlog / validation pack |

### Må sjekkes først

| Funn | Sjekk |
|---|---|
| 40 % erstatning, forsøksdesign og "ingen negative effekter" | Foods of Norway originalartikkel/PDF |
| 500 000 tonn soya i norsk lakseoppdrett | Handelsdata, Denofa, fôrprodusenter, original FoN-kilde |
| 30-50 % karbonavtrykkreduksjon | LCA-kilde og systemgrenser |
| GFI investeringstall og Norges relative posisjon | GFI-metode + aktive nordiske finansieringsprogrammer 2026 |
| Denofa/TRACES-problem | Denofa, Mattilsynet/KLD/LMD eller juridisk notat |
| Norsk EUDR-status for soya | Oppdatert etter høring/proposisjon og EU-kommisjonens 30.04.2026-rapport |
| TSE/ABP/kategori 3-substrater | Juridisk primærtekst + Mattilsynet |
| Villfisk til norsk oppdrettslaks ca. 2 mill. tonn | IFFO/FAO/Seafood/fôrindustri-kilde |
| Fôrselskapenes produksjonsvolum/markedsandeler | Årsrapporter og selskapssider |

## 8. Nye kandidater til masterkø

| Kilde/tema | Hvorfor |
|---|---|
| Foods of Norway originalartikkel/PDF for `Novel Microbial Protein...` | Nødvendig for å gjøre CL-A-001 citation-ready. |
| Denofa/IDH/handelsdata for norsk soya | Nødvendig for å rydde import-, sertifiserings- og EUDR-claims. |
| Mattilsynet/EU ABP/TSE primærtekster | Nødvendig for CL-A-011 og CL-A-021. |
| Skretting/BioMar/Cargill/Mowi råvare-/bærekraftsdata | Demand-side og fôr-KPI-er. |
| EU-kommisjonens EUDR simplification review etter 30.04.2026 | Kan endre compliance- og byrdebildet. |
| HI-nettrapport tabeller/sitatuttrekk | Gjør oppdrettskontekst citation-ready. |

## 9. Røde flagg

- Ikke bruk `04-innsatsvarer.md` som ekstern kilde for tall uten primærkilde.
- Ikke si at alternative fôringredienser løser oppdrettsrisiko; HI-kilden sier bare at risikoen er viktig kontekst.
- Ikke si at EUDR direkte regulerer norsk soyaimport gjennom EØS uten juridisk forbehold.
- Ikke bland soyabønner, soyamel, soyaproteinkonsentrat, kraftfôr og laksefôr.
- Ikke bruk `CL-A-007/008/009/010/014/015/016/017` som formelle claims før master rydder claim-registeret.
- Ikke løft A2/insektprotein som pilot uten substratlovlighet, mattrygghetsdata og kjøperkrav.
