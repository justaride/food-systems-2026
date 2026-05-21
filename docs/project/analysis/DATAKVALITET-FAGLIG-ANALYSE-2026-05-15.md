# Datakvalitet - faglig analyse og videre forskningsagenda

Dato: 2026-05-15  
Status: intern faglig vurdering  
Formål: vurdere datakvalitet, forbedringsbehov, videreutvikling og hva prosjektet bør forske på videre.

## Kort konklusjon

Prosjektet har en sterk operativ datagrunnmur, men ikke et jevnt faglig forskningsdatasett ennå. Databasen og de viktigste runtime-tabellene er friske: `npm run db:verify` viser alle tabeller over baseline, og `npm run db:audit` passerer referanseintegritet med 241 086 poster totalt. Det betyr at systemet er teknisk brukbart.

Den faglige svakheten ligger ikke primært i at data mangler overalt, men i at datalagene har ulik modenhet: Norge har observerte og relativt dype register-/verdikjededata, mens Norden ellers i stor grad består av kontekstdata, proxyer, reviewfiler, country packs, backlog og delvis importerte kilder. For ekstern analyse må prosjektet derfor unngå å presentere "nordisk" som ensbetydende med harmonisert, validert og sammenlignbar datadekning.

Den viktigste forbedringen er å behandle datakvalitet som en eksplisitt metode- og produktdimensjon: hvert datapunkt bør ha status, kildegrad, metodegrad, sammenlignbarhet, oppdateringsdato og beslutningsbruk. Uten dette blir plattformen lett visuelt overbevisende, men faglig sårbar.

## Faktisk status per 2026-05-15

### Teknisk og strukturell helse

Verifisert lokalt 2026-05-15:

| Sjekk | Resultat | Faglig betydning |
|---|---:|---|
| `npm run db:verify` | OK | Alle sentrale tabeller er over baseline. |
| `npm run db:audit` | OK | Referanseintegritet passerer for eierskap, relasjoner, personprofiler, dokumenter og sentrale dataflater. |
| Total audit-count | 241 086 poster | Stor operativ base, men antall er ikke det samme som analysekvalitet. |
| `Document` | 1 195 | Stor tekstbase, men land-/temafordeling er ujevn. |
| `SourceDoc` | 313 | Brukbar kildeindeks, men ikke full union av alle dokumenttyper. |
| `CountryMetric` | 414 | Økt tallgrunnlag, men krever metode-/sammenlignbarhetskontroll per serie. |
| `BusinessRelationship` | 121 | Verdikjede-/relasjonsflate finnes, men nordisk parity er ikke ferdig. |

Audit viser også kvalitetsmarkører som bør tas alvorlig:

- 11 rapporter mangler enkel `sourceUrl`, men er klassifisert med eksplisitt provenance-type som `internal_synthesis`, `internal_register`, `composite_source` eller `blocked_source`.
- DOI/persistent ID-dekning er begrenset: teser 36/78, rapporter 20/175, kilder 4/311.
- Rapport-publisherdekning er bedre, men ikke komplett: 126/175.

Dette er ikke "feil" i systemet, men det begrenser hvor hardt dataene kan brukes i akademisk dokumentasjon, KI-svar og eksterne beslutningsnotater.

### Nordisk og geografisk dekning

Lokale datafiler viser et tydelig mønster:

| Land | Value-chain steps | Stores | Flow | Romlig grunnlag | Infrastruktur-/registerdybde |
|---|---:|---:|---|---|---|
| NO | 8 | 3 849 | finnes | kommuner + geojson | farms, plants, ports, logistics hubs, aquaculture |
| SE | 8 | 5 049 | mangler | kommuner + geojson | mangler egne farm/plant/port/hub/flow-filer i landmappe |
| DK | 8 | 3 869 | mangler | kommuner + geojson | mangler egne farm/plant/port/hub/flow-filer i landmappe |
| FI | 8 | 2 860 | mangler | kommuner + geojson | mangler egne farm/plant/port/hub/flow-filer i landmappe |
| IS | 8 | 243 | mangler | kommuner + geojson | mangler egne farm/plant/port/hub/flow-filer i landmappe |

Dette betyr:

- Butikk-, kommune- og value-chain-dekning finnes for alle land, men dybden er ulik.
- Norge har klart sterkest operasjonell infrastrukturflate.
- `flows.json` finnes kun for Norge og bør ikke presenteres som nordisk flytmodell.
- Manglende landspesifikke flow-, farm-, plant-, port- og hubdata for SE/DK/FI/IS blokkerer likeverdig nordisk romlig forsyningskjedeanalyse.

### Gap- og reviewapparat

Prosjektet har et godt kontrollapparat:

| Artefakt | Rader | Rolle |
|---|---:|---|
| `research/_plans/gap-master-2026-04-29.csv` | 59 | Master over faglige datagap. |
| `research/_plans/gap-master-routing-2026-04-29.csv` | 59 | Eier, neste handling og akseptansegate. |
| `docs/project/analysis/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv` | 65 | Country/domain-dekning og reviewstatus. |
| `research/review/forsyningskjede-primary-source-check-queue-2026-04-29.csv` | 28 | Primærkildekontroll før import/bruk. |
| `research/data/nordic/core-series/production_annual_first_panel.csv` | 65 | Første produksjonspanel, men med metodebegrensninger. |
| `research/data/nordic/trade-groups/normalized/trade-group-imports-annual.csv` | 294 | Sterkere importpanel. |
| `research/norden/nordic-source-registry.csv` | 99 | Kilderegister/backlog for videre aktivering. |

Dette er faglig positivt: prosjektet har allerede mekanismer for å skille funn, kilde, metode, review og promotering. Svakheten er at reviewlaget ikke alltid er like synlig i produktflater og analysefortellinger.

## Kritiske kvalitetsrisikoer

### 1. Overclaim-risiko: "Nordisk" kan høres mer komplett ut enn det er

Den største faglige risikoen er at Norge-tunge data, nordiske kontekstfiler og proxyserier glir sammen i språk og visualisering. Det gir en plattform som virker mer sammenlignbar enn den faktisk er.

Tiltak: alle nordiske figurer og landkort må vise statuslane: `validated`, `primary_snapshot`, `proxy_model`, `local_research_needs_primary_check`, `missing`.

### 2. Datakvalitet er bedre dokumentert i researchlaget enn i brukerflaten

Prosjektet har gode reviewfiler, PCQ-køer og gapkort, men dette må oftere eksponeres i UI, rapporter og KI-svar. Ellers mister sluttbrukeren forskjellen mellom observerte data, proxyer, interne synteser og kandidatkilder.

Tiltak: innfør synlig "metode-/kildekort" per analyseflate: hva er observert, hva er modellert, hva er ikke validert, og hva krever ekstern kontroll.

### 3. Kildeproveniens er nyttig, men fortsatt for grovkornet for akademisk bruk

`sourceUrl`, `supportingSources`, `provenanceType` og lokale filer er bra for operativ sporbarhet. For faglig og KI-basert bruk trengs mer granulær proveniens: dokument -> side/kapittel -> avsnitt/chunk -> claim.

Tiltak: utvid provenance til chunk-/claimnivå for de viktigste kildene, særlig der plattformen skal gi siterbare svar.

### 4. DOI og persistent ID-dekning er lav

Lav DOI-dekning er ikke nødvendigvis et dataproblem for offentlige rapporter, men det er et troverdighetsproblem når materialet skal brukes akademisk. For avhandlinger er dekningen bedre, men rapporter og kilder bør få tydeligere persistent-ID-policy.

Tiltak: innfør et felt for `persistent_id_type` og `persistent_id`, ikke bare DOI. Bruk DOI, Handle, URN, ISBN, ISSN eller permanent rapport-URL der DOI ikke finnes.

### 5. Backlog er stor nok til å være verdifull, men også en risiko

Prosjektet har mange kilder i CSV-backlog og reviewlag. Det er bra, men en backlog kan skape falsk trygghet hvis den omtales som dekning før import og validering.

Tiltak: rapporter alltid kildestatus som fire separate tall: importert, reviewklar, hentet men ikke reviewet, kandidat/backlog.

### 6. Faglige gap er konsentrert i de vanskelige systemspørsmålene

De åpne gapene handler ikke bare om flere kilder, men om metode:

- harmonisert Scope 3 for dagligvareaktører
- husholdningsmatsvinn og atferdsdrivere
- marint restråstoff og verdikjedekart
- næringsstoffresirkulering
- oppdrettstap til fjord
- KPI-er for R0/R1/R4-R6
- matsystem-MFA
- sjømatjustert selvforsyning

Dette er forskningsoppgaver, ikke bare datainnhenting.

## Hva bør forbedres først

### 1. Lag et eksplisitt datakvalitetsnivå per datapunkt

Minimumsfelt for alle nye og promoterte data:

| Felt | Hvorfor |
|---|---|
| `quality_flag` | Skiller ok, partial, proxy, weak, request-needed. |
| `evidence_status` | Viser om data er validert, snapshot, kandidat eller missing. |
| `method_status` | Skiller direkte observasjon, beregning, proxy og intern syntese. |
| `comparability_flag` | Hindrer falsk land-til-land-sammenligning. |
| `last_verified` | Gjør det mulig å vurdere aktualitet. |
| `source_owner` | Skiller SSB/SCB/DST/StatFin, aktørkilde, bransje, forskning osv. |
| `source_ref` | Direkte URL, lokal fil eller registrert kilde-ID. |
| `claim_scope` | Presiserer hva datapunktet faktisk kan brukes til. |

### 2. Prioriter promotering fra review/backlog før ny bred leting

Før ny innsamling bør eksisterende strukturerte køer aktiveres:

1. `research/norden/nordic-source-registry.csv`
2. `research/norden/okologisk-source-queue-2026-04-29.csv`
3. `research/norden/notat-analyser-source-import-queue-2026-04-29.csv`
4. `research/norden/nordic-vision-2030-source-status-2026-04-29.csv`
5. `research/_plans/data-source-targets-2026-04-29.csv`

Målet bør ikke bare være flere dokumenter, men å lukke røde celler i tema/land-matrisen.

### 3. Gjør `/forsyningskjede` til hovedflate for datakvalitet

Forsyningskjede er riktig sted å vise samlet datamodenhet fordi siden kombinerer DB-relasjoner, leveransedata, lokale JSON/CSV-filer, importpanel og reviewstatus.

Neste produktgrep:

- landkort med seks faste rader: value-chain, import, produksjon, relasjoner, circularity/nutrients, åpne PCQ-rader
- synlig statuslane per rad
- tydelig skille mellom Norge-observert og nordisk proxy/kontekst
- ikke vise produksjonsparitet før `series_type` er eksplisitt

### 4. Bygg en faglig "source-to-claim" kjede

For de viktigste analysene må prosjektet kunne svare på:

1. Hvilken kilde støtter dette?
2. Hvor i kilden står det?
3. Hvilken påstand er hentet ut?
4. Er påstanden direkte, fortolket eller modellert?
5. Hvilke land/år/enheter gjelder den?
6. Hvilken beslutning kan den trygt brukes til?

Dette bør være standard for rapport, KI-svar og ekstern presentasjon.

## Videre forskningsagenda

### A. Harmonisert nordisk datadekning

Forskningsspørsmål:

- Hvilke indikatorer kan faktisk sammenlignes på tvers av NO/SE/DK/FI/IS?
- Hvor må hvert land ha egne metodebaner?
- Hvilke kilder er autoritative per land for produksjon, handel, avfall, markedskonsentrasjon og beredskap?

Prioriterte outputs:

- nordisk kildematrise per tema og land
- harmoniseringsnotat per indikatorfamilie
- datakvalitetsdashboard som viser validated/proxy/missing

### B. Scope 3 og aktørdata

Forskningsspørsmål:

- Kan NorgesGruppen/ASKO, Coop og Reitan sammenlignes på Scope 3 uten å blande ulike avgrensninger?
- Hvilke kategorier rapporteres, hvilke estimeres, og hva mangler?
- Hva kan valideres gjennom CDP, årsrapporter eller direkte aktørkontakt?

Prioriterte outputs:

- Scope 3-komparabilitetsmatrise
- requestpakke til aktører
- metodekort for hva som kan og ikke kan rangeres

### C. Matsvinn, sidestrømmer og atferd

Forskningsspørsmål:

- Hva er målt matsvinn, hva er selvrapportert atferd, og hva er forklaringsfaktorer?
- Hvor ligger de største sidestrømmene målt i volum, verdi og oppgraderingspotensial?
- Hvilke virkemidler påvirker faktisk adopsjon?

Prioriterte outputs:

- husholdningsmatsvinn-driverkort
- sidestream opportunity register
- skille mellom målt, modellert og intervjuvalidert data

### D. Næringsstoff- og materialflyt

Forskningsspørsmål:

- Hvor stort er N/P/K-gapet i norsk og nordisk matsystem?
- Hvor mye næring går tapt fra oppdrett, svartvann, husdyrgjødsel og matavfall?
- Hvilke tap kan realistisk lukkes gjennom biorest, slam, insekt, fermentering eller fôrsubstitusjon?

Prioriterte outputs:

- minimum MFA-modell
- nutrient budget-notat
- usikkerhetsspenn og proxy-policy

### E. Markedsmakt, konkurranse og lokal robusthet

Forskningsspørsmål:

- Er butikkantall-HHI nok for lokal konkurranserisiko, eller trengs omsetningsbasert HHI?
- Hvor stabile er markedsandeler over 10-15 år?
- Hvordan varierer lokal tilgang og sårbarhet med kommune, kjede og logistikkstruktur?

Prioriterte outputs:

- omsetningsandeler 2017-2019 hvis kilder finnes
- nordisk konkurransemyndighetsmatrise
- beslutning om når butikkantall-proxy er akseptabelt

### F. Beredskap og selvforsyning

Forskningsspørsmål:

- Hva betyr selvforsyning når sjømateksport justeres inn/ut?
- Hvilke land er reelt sterkest på beredskap, og hvorfor?
- Hvilke indikatorer viser robusthet: lager, diversitet, importavhengighet, produksjonskapasitet eller institusjonell respons?

Prioriterte outputs:

- sjømatjustert selvforsyningsscenario
- FI/NESA-beredskapspakke
- nordisk beredskapsindikator med metodeforbehold

## Anbefalt arbeidsprogram

### 0-2 uker: kvalitetsgrunnmur

1. Lås et felles datakvalitetsskjema for CSV/JSON/DB-promotering.
2. Kjør coverage-matrisen på nytt og lag før/etter-teller for importbatcher.
3. Aktiver eksisterende source-registry/backlog før ny bred kildejakt.
4. Merk alle proxyer og interne synteser tydelig i brukerflater og rapporter.

### 2-6 uker: lukking av de viktigste gapene

1. DK policy/adopsjon.
2. FI selvforsyning/beredskap.
3. SE/DK/IS sirkulært fôr.
4. IS sjømat/akvakultur/sirkularitet.
5. Bølge 1-gap: A4, G3, B12, A7, A6, B11.

### 6-12 uker: forskningsmodeller

1. Scope 3-komparabilitet.
2. Næringsstoff-/MFA-modell.
3. Sidestrømregister.
4. Matsvinn-driveranalyse.
5. Lokal konkurranse-/robusthetsmodell.

## Faglig kvalitetsstandard fremover

Prosjektet bør bruke denne tommelfingerregelen:

- `validated`: kan brukes i eksternt notat med kilde.
- `primary_snapshot`: kan omtales, men med metodeforbehold.
- `proxy_model`: kan brukes analytisk, men ikke som observert fakta.
- `local_research_needs_primary_check`: intern hypotese eller arbeidsgrunnlag.
- `missing`: ikke fyll med antakelser.

Det viktigste er ikke å tette alle hull raskest mulig. Det viktigste er å gjøre skillet mellom fakta, proxy, syntese og hypotese så tydelig at prosjektet tåler faglig kritikk.
