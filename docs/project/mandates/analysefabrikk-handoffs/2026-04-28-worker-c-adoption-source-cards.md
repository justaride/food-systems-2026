# Worker handoff - C-adoption source cards

## 1. Scope

- Tildelt batch: C-adoption, governance, markedsmekanismer og regulatorisk adoption-gate for Spor A og B.
- Filer/mapper lest:
  - `docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md`
  - `docs/project/mandates/underlagsgjennomgang-food-tg-2026-04-28.md`
  - `docs/project/mandates/track-brief-c-adoption.md`
  - `docs/project/mandates/claim-register-food-tg.md`
  - `docs/project/mandates/evidence-matrix-food-tg.md`
  - `research/regulatory/eu-farm-to-fork-strategy-2020.md`
  - `research/regulatory/eu-utp-directive-2019-633.md`
  - `research/regulatory/eu-utp-evaluering-desember-2025.md`
  - `research/regulatory/eu-ppwr-emballasjeforordningen-2025.md`
  - `research/bibliotek/akademia/pubmed/szulecka-j-2024-food-waste-governance-architectures-in.md`
  - `research/bibliotek/akademia/masteroppgaver/lehtokunnas-phd-2023.md`
  - `research/norden/regulatory-policy-landscape-nordic.md`
- Filer ikke funnet: ingen.
- Arbeidstype: source-card / verifikasjon / claim-effekt / adoption-gate.
- Ekstern rask sjekk: offisielle EU-sider brukt for å kontrollere at sentrale PPWR-, UTP- og Farm to Fork-påstander fortsatt er rimelige per 2026-04-28. Juridisk EØS/nasjonal tolkning er ikke ferdig validert.

## 2. Kort konklusjon

1. C-sporet styrker hovedgrepet i track brief C: adoption må være et tverrgående governance-lag for A og B, ikke et tredje teknologispor.
2. Sterkeste direkte kilder er UTP-direktivet, UTP-evalueringen 2025, PPWR 2025/40 og Farm to Fork som EU-policyretning. Disse kan brukes som regulatorisk baseline, men ikke som bevis på nordisk implementering.
3. UTP-kildene nyanserer markedsmaktclaimet: rettslig vern finnes, men adoption av nye leverandører avhenger av håndheving, anonymitet/klagevern og lavere frykt for gjengjeldelse.
4. PPWR er en konkret compliance-driver for matverdikjeden fra 2026 og utover, særlig emballasjedesign, matkontakt, gjenbruk, materialeffektivitet og HORECA/logistikk.
5. Szulecka 2024 og Lehtokunnas 2023 styrker at matsvinn/sirkulærøkonomi må designes som praksis- og governance-endring: aktører, rutiner, sortering, kaskadevalg og insentiver avgjør mer enn policytekst alene.
6. Nordic regulatory landscape er nyttig som internt kart, men må ikke siteres eksternt før alle konkrete landpåstander spores til primærkilder.

## 3. Source cards / triage rows

### SRC-C-003 - EU Farm to Fork Strategy

| Felt | Verdi |
|---|---|
| Filsti | `research/regulatory/eu-farm-to-fork-strategy-2020.md` |
| DB/ref | SourceDoc |
| URL/SHA | https://food.ec.europa.eu/horizontal-topics/farm-fork-strategy_en |
| Arkivlag | L1 |
| Spor | C/policy, A/B bakgrunn |
| Kildetype | primær/policy |
| Proveniens | external_report |
| Relevansscore | 4 |
| Evidensscore | 5 |
| Siterbarhet | Høy for EU-policyretning; Medium for nå-status |
| Status | source-card; citation-ready for policybakgrunn; needs-primary-check for implementering |
| Neste handling | Bruk som policybakgrunn, ikke effekt- eller implementeringsbevis. Sjekk Vision for Agriculture and Food 2025 og nasjonale implementeringsspor før ekstern tekst. |

#### Beslutningsfunn

1. Strategien gir overordnet EU-retning for et rettferdig, sunt og miljøvennlig matsystem og kobler miljø, matsikkerhet, folkehelse, konkurranseevne og fair trade.
2. Lokalt notat trekker fram 2030-mål for plantevernmidler, gjødsel, antimikrobiell bruk og økologisk areal, men også at gjennomføring er politisk forsinket/omforhandlet.
3. Kilden støtter at A og B må forholde seg til EU/EØS-retning, men den sier lite om faktisk norsk/nordisk adoption eller pilotgjennomføring.

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-C-004 | styrker | Dokumenterer EU-policyretningen og 2030-ambisjoner. |
| CL-C-001 | nyanserer | Viser at policyretning alene ikke er adoption; nasjonal implementering og praksis må sjekkes. |
| CL-C-015 | nyanserer | KPI-/roadmap-logikk bør kobles til faktiske data- og rapporteringssystemer, ikke bare EU-ambisjon. |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Regulering | Farm to Fork er strategisk ramme, ikke én bindende rettsakt. | Policybakgrunn for decision memo. |
| KPI | 2030-mål i lokalt notat: -50 % plantevernmidler, -20 % gjødsel, -50 % antimikrobiell bruk, 25 % økologisk areal. | Kan brukes med primærsjekk/oppdatert status. |
| Governance | EU-siden vektlegger både regulatoriske og ikke-regulatoriske initiativer. | Støtter at C må ha virkemiddelblanding. |

#### Usikkerhet

- Farm to Fork er delvis erstattet/omrammet av Vision for Agriculture and Food 2025. Bruk derfor formuleringen "EU-policyretning", ikke "gjeldende operativ plan" uten sjekk.
- EØS-relevans varierer etter tema: mattrygghet og emballasje er sterkere EØS-spor enn CAP/landbrukspolitikk.

#### Valideringsspørsmål

- Hvilke Farm to Fork-elementer er faktisk implementert eller planlagt i Norge/EØS per 2026?
- Hvilke deler er relevante for pilotvalg A/B, og hvilke er bare bakgrunn?

### SRC-C-004 - EU Directive 2019/633, Unfair Trading Practices

| Felt | Verdi |
|---|---|
| Filsti | `research/regulatory/eu-utp-directive-2019-633.md` |
| DB/ref | SourceDoc |
| URL/SHA | https://eur-lex.europa.eu/eli/dir/2019/633/oj/eng |
| Arkivlag | L1 |
| Spor | C/policy, market power |
| Kildetype | primær/rettsakt |
| Proveniens | external_report |
| Relevansscore | 5 |
| Evidensscore | 5 |
| Siterbarhet | Høy |
| Status | source-card; citation-ready for EU-rettsramme; needs-national-check for Norge/Norden |
| Neste handling | Bruk som juridisk baseline. Kryssjekk norsk lov om god handelsskikk og nordisk implementering før landpåstander. |

#### Beslutningsfunn

1. Direktivet etablerer minimumsregler mot urimelig handelspraksis i jordbruks- og matforsyningskjeden.
2. Vernet er særlig relevant for mindre/medium leverandører i møte med sterkere kjøpere og støtter C-sporets markedsmaktgate.
3. Direktivet dokumenterer rettslig ramme, men ikke om nye sirkulære leverandører faktisk får kontrakter, volum eller trygg klageadgang.

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-C-005 | styrker | Kilden er primærrettslig baseline for UTP-regulering. |
| CL-C-006 | nyanserer | Direktivet krever håndheving og klagevern før markedsmakt endres i praksis. |
| CL-C-001 | styrker | Regulatorisk ramme er en nødvendig adoption-komponent. |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Regulering | Minimumsliste over forbudte UTP-er og minimumsregler for håndheving. | Juridisk baseline. |
| Datakrav | Omsetningsterskler og relasjon mellom kjøper/leverandør avgjør vern i EU-direktivet. | Sjekkliste for hvem som dekkes. |
| Håndheving | Direktivet legger ramme, men nasjonale myndigheter avgjør praktisk håndheving. | Adoption-gate for markedsmakt. |

#### Usikkerhet

- Norge er ikke direkte bundet av direktivet på samme måte som EU-medlemsland; norsk lov om god handelsskikk må behandles separat.
- Lokalt notat oppsummerer 2025-evalueringen i samme fil. For evalueringstall bør master sitere egen evalueringskilde, ikke direktivfilen.

#### Valideringsspørsmål

- Hvilke av UTP-verktøyene gjelder faktisk for leverandørtypene i A/B-piloter?
- Hvordan påvirker mulig flytting fra Dagligvaretilsynet til Konkurransetilsynet klagevern og håndheving?

### SRC-C-005 - EU UTP Evaluation December 2025, COM(2025) 728

| Felt | Verdi |
|---|---|
| Filsti | `research/regulatory/eu-utp-evaluering-desember-2025.md` |
| DB/ref | SourceDoc |
| URL/SHA | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52025DC0728 |
| Arkivlag | L1 |
| Spor | C/policy, market power, enforcement |
| Kildetype | primær/kommisjonsrapport |
| Proveniens | external_report |
| Relevansscore | 5 |
| Evidensscore | 5 |
| Siterbarhet | Høy |
| Status | source-card; citation-ready for EU-håndhevingsfunn; needs-national-check for norsk overføring |
| Neste handling | Bruk til CL-C-006 og enforcement-gate. Ikke overfør EU-tall direkte til Norge uten egen nasjonal sjekk. |

#### Beslutningsfunn

1. Evalueringen gir fersk evidens for at regelverk ikke er nok: undersøkelser, sanksjoner, rapporteringsfrykt og myndighetssamarbeid avgjør effekt.
2. EU-kommisjonens egen oppsummering oppgir mer enn 4 500 undersøkelser 2021-2024, omtrent en tredjedel bruddfunn blant avsluttede undersøkelser, 754 saker og 41,9 millioner euro i bøter 2022-2024.
3. Frykt for gjengjeldelse trekkes fortsatt fram som en hovedbarriere for rapportering, og proactive investigations/anonyme tips blir relevante enforcement-mekanismer.

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-C-006 | styrker | Viser at håndheving, rapporteringsvern og faktisk bruk er nødvendig for markedsmaktseffekt. |
| CL-C-005 | nyanserer | Direktivets eksistens må skilles fra håndhevingseffekt. |
| CL-C-001 | styrker | Adoption må forstås som institusjonell håndheving + markedsstruktur, ikke bare teknologi. |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Tall | 4 500+ undersøkelser, 754 bruddsaker, EUR 41,9m i bøter. | Sterk EU-håndhevingsindikator. |
| Håndheving | Frykt for gjengjeldelse er fortsatt hovedbarriere for rapportering. | Markedsmakt/adoption-gate. |
| Regulering | Kommisjonen peker på behov for styrking av UTP-rammen og grenseoverskridende samarbeid. | Policy- og governancekontekst. |

#### Usikkerhet

- EU-evalueringen gjelder 27 medlemsland og kan ikke direkte beskrive norsk effekt.
- Tall og formuleringer bør hentes fra COM(2025) 728 eller Kommisjonens nyhetsside ved ekstern bruk.

#### Valideringsspørsmål

- Har Norge tilsvarende anonym varsling, proactive enforcement og praktisk klagevern?
- Hvilke nye sirkulære leverandører ville faktisk tørre å melde kontrakts-/innkjøpsbarrierer?

### SRC-C-006 - EU Packaging and Packaging Waste Regulation, PPWR 2025/40

| Felt | Verdi |
|---|---|
| Filsti | `research/regulatory/eu-ppwr-emballasjeforordningen-2025.md` |
| DB/ref | SourceDoc |
| URL/SHA | https://eur-lex.europa.eu/eli/reg/2025/40/oj/eng |
| Arkivlag | L1 |
| Spor | C/policy, B-sidestream, procurement/logistics |
| Kildetype | primær/rettsakt |
| Proveniens | external_report |
| Relevansscore | 5 |
| Evidensscore | 5 |
| Siterbarhet | Høy |
| Status | source-card; citation-ready for EU-krav; needs-EEA-check for Norge |
| Neste handling | Bruk som compliance-driver. Sjekk EØS-innlemmelse, veiledere og aktørenes kost/tilpasning før roadmap-konklusjoner. |

#### Beslutningsfunn

1. PPWR er en konkret regulatorisk adoption-driver fra 2026 og framover, med direkte betydning for emballasjedesign, matkontakt, logistikk, gjenbruk og innkjøp.
2. Offisiell EU-side bekrefter at PPWR trådte i kraft 11. februar 2025 og generelt skal gjelde fra 12. august 2026.
3. Matkontaktemballasje, PFAS, single-use-begrensninger, resirkulerbarhet, resirkulert innhold og gjenbrukbar transportemballasje kan påvirke både matsvinn, holdbarhet, HORECA og dagligvaredrift.

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-C-010 | styrker | PPWR gir bindende krav som kan endre design, logistikk og compliance. |
| CL-C-014 | nyanserer | Praktisk adoption skjer i emballasjevalg, pakking, transport, retur og sortering. |
| CL-B-022 | nyanserer | Matsvinnkvalitet påvirkes av emballasje/holdbarhet; sirkulær emballasje må ikke svekke ferskvareverdi. |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Regulering | Generell anvendelse fra 12. august 2026. | Roadmap-tidslinje. |
| Regulering | PFAS-restriksjoner for matkontaktemballasje fra august 2026 over terskler oppgitt i lokal kilde. | Compliance-gate for emballasje. |
| Innkjøp | Emballasje- og transportkrav må inn i kravspesifikasjoner for dagligvare, HORECA og offentlige kjøkken. | Procurement-gate. |
| Datakrav | Dokumentasjon på materialer, resirkulerbarhet, resirkulert innhold og leverandøransvar. | Dataskjema for A/B. |

#### Usikkerhet

- EØS-innlemmelse og norsk implementering må sjekkes før formuleringen "gjelder i Norge".
- Emballasjetiltak kan ha målkonflikt med matsvinn hvis holdbarhet eller mattrygghet svekkes. Må valideres per varegruppe.

#### Valideringsspørsmål

- Hvilke PPWR-krav treffer konkrete B-piloter: matsvinnkvalitet, okara/sidestrøm, HORECA, redistribusjon?
- Har aktuelle kjøpere/leverandører data på emballasjemateriale, returgrad, svinn og holdbarhet?

### SRC-C-008 - Szulecka, Bradshaw & Principato 2024, Food Waste Governance Architectures

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/pubmed/szulecka-j-2024-food-waste-governance-architectures-in.md` |
| DB/ref | PubMed / PMC |
| URL/SHA | DOI: https://doi.org/10.1002/gch2.202300265 |
| Arkivlag | L2 |
| Spor | C/policy, B-sidestream |
| Kildetype | sekundær/fagfellevurdert artikkel |
| Proveniens | external_article |
| Relevansscore | 5 |
| Evidensscore | 4 |
| Siterbarhet | Medium/Høy |
| Status | source-card; citation-ready med kontekst |
| Neste handling | Bruk til governance-claim og matsvinnstyring. Les PDF/fulltekst for nøyaktige formuleringer/sidetall før ekstern sitering. |

#### Beslutningsfunn

1. Artikkelen erstatter enkel lov/frivillighet-dikotomi med governance-arkitekturer: aktørkonstellasjoner og styringsformer må analyseres sammen.
2. Norge og England, ofte beskrevet som frivillige modeller, har også en "legislative turn" eller lovtrussel; Frankrike og Italia er mer hybride enn standardfortellingen tilsier.
3. Detaljhandelens innflytelse kan begrense hvor ambisiøse forpliktelser blir, og matsvinnstyring må skille forebygging fra redistribusjon/avfallshåndtering.

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-C-001 | styrker | Direkte støtte for at adoption er governance-arkitektur, ikke bare teknologi. |
| CL-C-014 | styrker | Støtter at strategier må oversettes til aktørpraksis og insentiver. |
| CL-C-012 | ny claim/legacy | Evidence matrix peker på CL-C-012, men claim-register har ikke formell CL-C-012. Foreslå ny claim: "Matsvinnstyring krever hybrid governance som skiller forebygging fra redistribusjon/avfall." |
| CL-B-001 | nyanserer | B-tiltak må skille mellom forebygging, redistribusjon og avfallsbehandling. |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Governance | Fire lands matsvinnmodeller analyseres som styringsarkitekturer. | C-rammeverk. |
| Aktør | Detaljhandel har ofte betydelig innflytelse på forpliktelsenes ambisjonsnivå. | Markedsmakt/adoption gate. |
| Regulering | Lovgivende dreining/lovtrussel kombineres med frivillighet og marked. | Policy-miks, ikke enten/eller. |

#### Usikkerhet

- Studien sier mer om styringsarkitektur enn om dokumentert svinnreduksjon.
- Fulltekst bør brukes for sitat/sidetall; lokal MD er en kuratert oppsummering.

#### Valideringsspørsmål

- Hvilke norske aktører definerer faktisk ambisjonsnivået i matsvinnavtaler og praktiske B-piloter?
- Kan TG skille klart mellom forebygging, redistribusjon og restbehandling i piloter og KPI-er?

### SRC-C-010 - Lehtokunnas PhD 2023, Enacting a Circular Economy

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/masteroppgaver/lehtokunnas-phd-2023.md` |
| DB/ref | Thesis |
| URL/SHA | Ikke oppgitt i lokal fil |
| Arkivlag | L1 |
| Spor | C-adoption, B-sidestream |
| Kildetype | primær/PhD |
| Proveniens | external_report |
| Relevansscore | 4 |
| Evidensscore | 4 |
| Siterbarhet | Medium/Høy hvis original avhandling sjekkes |
| Status | source-card; needs-primary-check for URL/sidetall |
| Neste handling | Bruk som praksisteoretisk støtte. Finn original avhandling/URL før ekstern sitering. |

#### Beslutningsfunn

1. Sirkulærøkonomi realiseres gjennom hverdagspraksis i supermarkeder, husholdninger og biogassanlegg, ikke bare gjennom top-down policy.
2. Butikkpraksiser som prising, plassering og fjerning av varer kan være like viktige som teknologiske løsninger.
3. Studien viser at flere "sirkulære fremtider" konkurrerer om legitimitet; en pilot må derfor avklare hvilken type sirkularitet den faktisk optimaliserer for.

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-C-014 | styrker | Direkte støtte for rutiner, sortering, infrastruktur og praksis som adoption-mekanisme. |
| CL-B-022 | styrker | Støtter butikk-/HORECA-praksis som mulig rask adoption-pilot for matsvinnkvalitet. |
| CL-C-015 | nyanserer | KPI-er må kobles til praksiser som faktisk kan observeres og registreres. |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Case | Supermarkeder, husholdninger og biogassanlegg i Finland. | Praksis-/operasjonsdesign. |
| KPI | Observerbare praksiser: prising, plassering, varefjerning, sortering, biogasslogistikk. | Kandidat-KPI-er for B/C, men må valideres. |
| Governance | Flere konkurrerende sirkulære fremtider. | Scope-disiplin: hva måles, og hva prioriteres? |

#### Usikkerhet

- Empirien er finsk og etnografisk; overføring til norsk dagligvare/HORECA må gjøres forsiktig.
- Lokal fil mangler URL/DOI; original må finnes for citation-ready status.

#### Valideringsspørsmål

- Hvilke konkrete butikk-/kjøkkenrutiner kan endres uten å øke kost, bemanningspress eller mattrygghetsrisiko?
- Hvilke observasjonspunkter kan måles før/etter i en pilot?

### SRC-C-001 - Nordic Food Systems: Regulatory & Policy Landscape

| Felt | Verdi |
|---|---|
| Filsti | `research/norden/regulatory-policy-landscape-nordic.md` |
| DB/ref | SourceDoc / intern syntese |
| URL/SHA | Flere lenker i dokumentet; ingen enkelt URL |
| Arkivlag | L3 |
| Spor | C/policy, baseline, A/B adoption |
| Kildetype | intern syntese |
| Proveniens | internal_synthesis |
| Relevansscore | 5 |
| Evidensscore | 2 |
| Siterbarhet | Lav/Medium internt; ikke ekstern sitat før primærsjekk |
| Status | triagert; needs-primary-check |
| Neste handling | Bruk som kart og sjekkliste. Splitt konkrete landpåstander til primærkilder før evidence matrix/ekstern bruk. |

#### Beslutningsfunn

1. Dokumentet gir nyttig samlet kart over konkurransemyndigheter, UTP-regimer, EØS-gap, food security, sirkulær policy og PPWR/EUDR.
2. Hovedsyntesen er at nordiske markeder er konsentrerte, men policyverktøy og håndheving varierer sterkt.
3. EØS skaper norsk regulatorisk patchwork: mattrygghet harmoniseres, mens landbrukspolitikk, toll, UTP og enkelte råvare-/EUDR-spørsmål må behandles separat.

#### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-C-001 | styrker internt | Gir C-sporets komparative ramme, men må primærsjekkes. |
| CL-C-005 | nyanserer | Norge har egen lovgivning; EU-direktivet kan ikke omtales som direkte norsk basis. |
| CL-C-006 | styrker/nyanserer | Håndhevingsgapet fremstår sentralt, men konkrete tall/status må sjekkes. |
| CL-C-010 | nyanserer | PPWR er EU-regelverk med EØS-innlemmelse for Norge, ikke nødvendigvis samme ikrafttredelseslogikk som EU-land. |
| CL-C-011 | nyanserer | EUDR/soya er relevant for A, men norsk EØS/nasjonal behandling må juridisk sjekkes. |

#### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Regulering | NO/DK/SE/FI har ulike UTP-/konkurranseverktøy og håndhevingsorganer. | Aktør- og enforcementkart. |
| Håndheving | Norge beskrives med svakt fair-trading enforcement sammenlignet med rammeverkets bredde. | Rødt flagg for CL-C-006. |
| Datakrav | EEA gap: samme mattrygghetsgulv, men ulik landbruk, toll, EUDR, CAP og innkjøpsvirkemidler. | Scope-gate for A/B. |
| Innkjøp | Policykart peker på offentlig innkjøp og sirkulærøkonomi som adoption-mulighet, men ikke dokumentert effekt. | Intervjuspørsmål, ikke claim alene. |

#### Usikkerhet

- Mange påstander er tidsfølsomme: markedsandeler, myndighetsendringer, bøter, matberedskapsmål, EUDR-tidslinjer og EU food waste targets.
- Kilden bør ikke være eneste støtte for eksterne landclaims.

#### Valideringsspørsmål

- Hvilke landpåstander er nødvendige for decision memo, og hvilke kan kuttes?
- Hvilke primærkilder må master hente først: Konkurransetilsynet, KFST, Konkurrensverket, FCCA, Regjeringen, Mattilsynet, EU/EFTA?

## 4. C-claims som styrkes/svekkes/nyanseres

| Claim | Effekt | Kilder | Master-handling |
|---|---|---|---|
| CL-C-001 | styrkes | SRC-C-001, SRC-C-008, SRC-C-004/005 | Behold som hovedramme: adoption = regulering + håndheving + markedsstruktur + praksis. |
| CL-C-002 | nyanseres | SRC-C-001, indirekte SRC-C-008/010 | Offentlig innkjøp kan være motor, men dette scopet gir ikke direkte innkjøpsbevis. Må fortsatt valideres med innkjøpere/kjøkken. |
| CL-C-004 | styrkes/nyanseres | SRC-C-003 | Bruk som EU-policybakgrunn. Ikke bruk som implementerings- eller effektclaim. |
| CL-C-005 | styrkes | SRC-C-004 | Juridisk baseline står sterkt for EU. Legg til nasjonal implementeringssjekk for Norge/Norden. |
| CL-C-006 | styrkes kraftig | SRC-C-005, SRC-C-001 | Evalueringsfunn gjør håndheving, rapporteringsvern og gjengjeldelsesfrykt til hard gate for markedsmakt/adoption. |
| CL-C-010 | styrkes | SRC-C-006 | PPWR er konkret compliance-driver. EØS/norsk implementering og varegruppeeffekt må sjekkes. |
| CL-C-011 | nyanseres | SRC-C-001, eksisterende EV-C-007 ikke lest i dette scopet | EUDR må fortsatt være A-gate, men master bør bruke EUDR-kilden direkte, ikke nordisk syntese alene. |
| CL-C-014 | styrkes kraftig | SRC-C-010, SRC-C-008, SRC-C-006 | Praksis, rutiner, sortering, emballasje og infrastruktur må inn i pilotdesign. |
| CL-C-015 | nyanseres | SRC-C-010, SRC-C-006, SRC-C-001 | KPI-claim bør holdes som hypotese til datatilgang og rapporteringsansvar er bekreftet. |
| Ny/legacy CL-C-012 | foreslå ny claim | SRC-C-008 | "Matsvinnstyring krever hybrid governance og tydelig skille mellom forebygging, redistribusjon og restbehandling." |

Ingen C-claims bør svekkes direkte av scopet. Den viktigste svekkelsen er mot for sterke formuleringer: policy/regelverk må ikke omtales som implementert praksis eller effekt.

## 5. Adoption-gate for Spor A og B

| Gate | Spor A - sirkulært fôr/import | Spor B - sidestrømmer/næringsstoffløkker | Minimum før scope låses |
|---|---|---|---|
| Regulatorisk krav | Lovlige fôrsubstrater, ABP/TSE, mattrygghet, import-/EUDR-sporbarhet, dokumentasjon for nye ingredienser. | Lovlig sluttbruk for mat, ingrediens, fôr, biogass, digestat/gjødsel, matkontakt/emballasje. | Skriftlig primærsjekk eller faglig avklaring fra Mattilsynet/EU-EØS-kompetanse. |
| Håndheving/markedsmakt | Nye fôrleverandører må ha realistisk tilgang til kjøpere uten urimelig risikooverføring, kontraktsbarrierer eller rapporteringsfrykt. | Dagligvare/HORECA/industri må kunne endre rutiner uten at leverandør- eller driftsrisiko bare skyves nedover. | Intervju med både kjøper og leverandør/driftsaktør; vurder UTP/kontraktsrisiko. |
| Datakrav | Opprinnelse, batch, substrat, kontaminanter, prosess, kvalitet, pris, volum, LCA/sporbarhet. | Volum, temperatur, holdbarhet, renhet, batchvariasjon, emballasje, logistikk, nåværende destinasjon, sluttbruk. | Minimumsdataskjema med navngitt dataleverandør. |
| Innkjøp/demand-side | Fôr-/sjømataktør må bekrefte volumterskel, prisvilje, kvalitetskrav og risikoaksept. | Offentlig kjøkken, HORECA, dagligvare eller ingrediensaktør må bekrefte kjøps-/bruksinteresse og driftsmulighet. | Minst én konkret demand-side aktør per pilotretning. |
| Governance | Eier for pilot, regulatorisk reviewer, kjøper, dataleverandør og risikoeier må navngis. | Driftsansvar, kvalitetsansvar, dataansvar, emballasje/logistikkansvar og sluttbruksansvar må navngis. | Pilot-RACI eller tilsvarende eierskapskart. |
| Praksis/adoption | Test om rutiner i fôrkjede og leverandørdokumentasjon faktisk kan endres. | Test butikk-/kjøkken-/sorteringspraksis, vareflyt og tidsvinduer før kommunikasjonspilot. | Observasjon/intervju av operativ praksis, ikke bare lederintervju. |
| KPI | Ikke love importsubstitusjon eller utslipp uten volum, substitusjon og baseline. | Ikke love svinnreduksjon/sirkularitet uten baseline, fraksjonsdata og målepunkt. | KPI-er internt inntil datatilgang er bekreftet. |

## 6. Regulatoriske krav, håndheving, datakrav, innkjøp og governance

### Regulatoriske krav

- Farm to Fork: policyretning og 2030-ambisjon; ikke tilstrekkelig som pilotkrav.
- UTP: rettslig baseline for rettferdig handel og leverandørvern i EU; norsk lov må sjekkes separat.
- UTP-evaluering 2025: viser at håndheving og rapporteringsvern er aktivt problem, ikke bare juridisk fotnote.
- PPWR: konkret regulatorisk gate for matkontakt, emballasjedesign, single-use, resirkulerbarhet, resirkulert innhold, gjenbruk og logistikk.
- EØS: må skilles tydelig mellom EU-medlemsland og Norge, særlig for CAP, landbruk, toll, EUDR og PPWR-innlemmelse.

### Håndheving

- UTP-evalueringen styrker argumentet om at markedsmakt ikke løses ved rettsakt alene.
- Anonyme tips, proactive investigations, nasjonalt enforcementnivå og frykt for gjengjeldelse bør inn i C-gate.
- Norsk håndheving må primærsjekkes; nordisk syntese peker på mulig håndhevingsgap, men er ikke siterbar alene.

### Datakrav

- A trenger sporbarhet/opprinnelse, batchdata, substrat-/prosessdata, kontaminant-/mattrygghetsdata, volum, pris og mulig EUDR/due diligence.
- B trenger volum, fraksjon, kvalitet, holdbarhet, temperatur, emballasje, logistikk, nåværende destinasjon, lovlig sluttbruk og målepunkt for kaskade.
- PPWR legger til emballasjedata og material-/matkontaktcompliance.
- KPI-er bør ikke flyttes fra intern styring til ekstern effekt før dataleverandør og målefrekvens er bekreftet.

### Innkjøp

- Innkjøp er fortsatt hypotetisk adoptionmotor i dette scopet. Kildene støtter behovet, men ikke at offentlige kjøkken eller HORECA faktisk kan kjøpe pilotstrømmene.
- PPWR kan gjøre emballasje- og logistikkkrav til del av innkjøpsspesifikasjoner.
- UTP/håndheving bør brukes som sjekk mot om nye leverandører får realistiske kontraktsvilkår.

### Governance

- Szulecka 2024 tilsier at matsvinnstyring bør designes som hybrid governance, ikke lov vs frivillighet.
- Lehtokunnas 2023 tilsier at pilotgovernance må ned på rutiner og praksisnivå.
- C-gate bør kreve navngitt eier for: regulatorisk review, data, innkjøp, drift, kvalitet, rapportering og risiko.

## 7. Hva master kan integrere nå vs. må sjekke først

### Kan integreres nå

| Funn | Bruk | Forbehold |
|---|---|---|
| C skal være tverrgående adoption-/governance-lag for A og B. | Decision memo / track brief C | Står allerede sterkt; ikke eksternt validert. |
| Farm to Fork gir EU-policyretning, men ikke bevis på nordisk implementering. | CL-C-004-nyansering | Oppdatert med Vision 2025 ved ekstern tekst. |
| UTP-direktivet er juridisk baseline, mens UTP-evalueringen viser enforcement- og rapporteringsvern som nøkkel. | CL-C-005/006 | Skille EU og Norge. |
| PPWR er konkret compliance-driver for emballasje/logistikk/matkontakt. | CL-C-010 | Sjekk EØS for Norge. |
| Matsvinn/sirkulærøkonomi må forstås som governance + praksis, ikke bare teknologi eller frivillig avtale. | CL-C-001/014 og B-pilotdesign | Bruk Szulecka/Lehtokunnas med kontekst. |
| Adoption-gate for A/B bør kreve regulatorisk avklaring, demand-side, dataskjema, håndhevings-/markedsmaktvurdering og pilot-eierskap. | Decision memo og aktørpakke | Aktørvalidering gjenstår. |

### Må sjekkes først

| Funn | Hvorfor sjekke | Foreslått sjekk |
|---|---|---|
| Alle konkrete nordiske landpåstander i regulatory-policy-landscape. | Intern syntese; tidsfølsomt. | Primærkilder fra myndigheter/tilsyn. |
| Norsk status for Dagligvaretilsynet/Konkurransetilsynet og håndheving av god handelsskikk. | Politisk/organisatorisk endring. | Regjeringen, Stortinget, tilsynsårsrapporter. |
| EØS-innlemmelse og norsk anvendelse av PPWR/EUDR. | Juridisk nyanse avgjør A/B claims. | EFTA/EØS, regjeringen, Mattilsynet/Miljødirektoratet. |
| Offentlig innkjøp som faktisk demand-side for B. | Dette scopet har ikke sterk primærkilde på kjøpskapasitet. | Kommunal/offentlig innkjøper og kjøkkenintervju. |
| KPI-er for sirkularitet. | Datatilgang og rapporteringssystemer er ikke bekreftet. | Dataleverandør/intervjuer, systemkart, pilotbaseline. |
| Lehtokunnas original URL/sidetall. | Lokal fil mangler URL. | Finn avhandling i Tampere University repository. |
| Szulecka eksakte sitater/sidetall. | Lokal fil er oppsummering. | Bruk PDF/fulltekst fra PMC/DOI. |

## 8. Nye kandidater til masterkø

| Kilde | Hvorfor |
|---|---|
| EU Commission Vision for Agriculture and Food, COM(2025) 75 / 19.02.2025 | Må brukes for å nyansere Farm to Fork-status etter 2024/2025 policyomlegging. |
| Offisiell PPWR guidance/FAQ publisert 2026 | Praktisk tolkning for økonomiske aktører før 12.08.2026. |
| Norsk statusnotat om PPWR/EØS-innlemmelse | Nødvendig før claims om norsk matverdikjede. |
| Regjeringen/Stortinget om Dagligvaretilsynet/Konkurransetilsynet 2025-2026 | Nødvendig for håndhevings- og markedsmaktclaims. |
| Mattilsynet-veiledning for fôrsubstrater, tidligere matvarer, ABP/TSE og sidestrømmer | Hard regulatorisk gate for A/B. |
| Offentlig innkjøpscase eller kommunalt kjøkkenintervju | Mangler sterk kilde for CL-C-002. |

## 9. Røde flagg

- Ikke bland EU-direktiv/forordning med norsk rett uten EØS/nasjonal sjekk.
- Ikke bruk `research/norden/regulatory-policy-landscape-nordic.md` som ekstern kilde; det er et godt kart, men L3.
- Ikke bruk UTP-direktiv som bevis på markedsendring. Håndheving og frykt for gjengjeldelse må inn.
- Ikke la PPWR bli ren "emballasje er bra"-driver. Matkontakt, holdbarhet, matsvinn og logistikk kan gi målkonflikter.
- Ikke gjør KPI-claim eksternt før dataleverandør, målepunkt og baseline er bekreftet.
- Evidence matrix peker på CL-C-012/013/016/017/018/019/020 i noen rader, men claim-registeret har formelt bare CL-C-001, 002, 004, 005, 006, 010, 011, 014, 015. Master bør rydde legacy/frempeker-IDer senere.
