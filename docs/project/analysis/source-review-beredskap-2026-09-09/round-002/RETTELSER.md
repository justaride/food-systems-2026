# Rettelser og avgrensninger

Disse er interne rettelsesforslag etter kildekontroll. Originale observasjoner er bevart. Ingen kanonisk rad er endret. «Støttet med begrensninger» betyr at begrensningen følger med ved bruk; det er ikke en ubetinget godkjenning.

## A3-O010 — supported_with_limits

12.7% matches. Instrument is a single question and dichotomizes never versus any frequency (excluding do-not-know). 2019 is fieldwork, not an explicitly fixed12-month recall. N991, sample15–74, response39.6%.

**Bruk i videre arbeid:** Retain single-question and non-fixed-recall warning; do not label as FIES or a2026 prevalence.

## A3-O011 — supported_with_limits

Family percentages and counts match. Income variable is respondent gross income (Vastaajan bruttotulot), not household income. Associations and small subgroupN retained.

**Bruk i videre arbeid:** Rename grossMonthlyIncome to respondentGrossMonthlyIncome; do not align it to SIFO/Swedish household-income bands.

## A3-O012 — insufficient_evidence

Original table establishes proxy definition and2022 method break. Numeric selected cells were not present in fetched selector; previous API result was not archived. Three API metadata URL attempts returned Bad Request or web-reader failure.

**Bruk i videre arbeid:** Retain existence/definition/method break; quarantine15 numeric cells until exact request/response can be preserved.

## A3-O013 — supported_with_limits

Eight-question access metric supported; FAO allows household OR individual and recent OR annual uses. 15+ and12months are specific catalog scopes, not universal FIES definition.

**Bruk i videre arbeid:** Keep generic FIES separately from the selected Nordic catalog instruments.

## A3-O014 — supported_with_limits

Listed design effect, maximum error and mode match original metadata; Finland field dates22April–14June verified. Error is maximum at50% prevalence and95% confidence, not an error bar for a country FIES estimate.

**Bruk i videre arbeid:** Label marginOfErrorPercentagePoints as surveyMaximumMarginOfErrorAtP50; never attach it to FAOSTAT estimate intervals.

## A3-O015 — supported_with_limits

Listed design effect, maximum error and mode match original metadata; Finland field dates22April–14June verified. Error is maximum at50% prevalence and95% confidence, not an error bar for a country FIES estimate.

**Bruk i videre arbeid:** Label marginOfErrorPercentagePoints as surveyMaximumMarginOfErrorAtP50; never attach it to FAOSTAT estimate intervals.

## A3-O016 — supported_with_limits

Listed design effect, maximum error and mode match original metadata; Finland field dates22April–14June verified. Error is maximum at50% prevalence and95% confidence, not an error bar for a country FIES estimate.

**Bruk i videre arbeid:** Label marginOfErrorPercentagePoints as surveyMaximumMarginOfErrorAtP50; never attach it to FAOSTAT estimate intervals.

## A3-O017 — supported_with_limits

Listed design effect, maximum error and mode match original metadata; Finland field dates22April–14June verified. Error is maximum at50% prevalence and95% confidence, not an error bar for a country FIES estimate.

**Bruk i videre arbeid:** Label marginOfErrorPercentagePoints as surveyMaximumMarginOfErrorAtP50; never attach it to FAOSTAT estimate intervals.

## A3-O018 — supported_with_limits

Listed design effect, maximum error and mode match original metadata; Finland field dates22April–14June verified. Error is maximum at50% prevalence and95% confidence, not an error bar for a country FIES estimate.

**Bruk i videre arbeid:** Label marginOfErrorPercentagePoints as surveyMaximumMarginOfErrorAtP50; never attach it to FAOSTAT estimate intervals.

## A3-O019 — supported_with_limits

Both design effects/error/fieldwork dates and Finland WHLDAY exclusion match. Both pages describe telephone sampling; fetched2020 pages do not explicitly label CATI in data-collection mode.

**Bruk i videre arbeid:** Change common mode from CATI to telephone sampling documented; CATI not separately verified for2020. Maintain8 administered items vs7 used for Finland indicator distinction.

## A3-O020 — supported_with_limits

All75 values/bounds checked deterministically against original CSV. Item210091 explicitly total population, percent,3-year average. Overlapping windows and wide overlapping bounds do not establish a Nordic league table.

**Bruk i videre arbeid:** Keep2023–2025 as3-year estimate, not2025 annual prevalence. Archive member timestamp is packaging metadata, not publication date.

## A3-O021 — supported_with_limits

207 regular sites,59% rationing,one-third of struggling sites sending some people home match. Denominators differ. Reported one-third is approximate, not exact33% measurement.

**Bruk i videre arbeid:** Store sendHomeWithoutBagAmongStruggling as about_one_third or approximate33, not exact33.

## A3-O024 — supported_with_limits

IFRO explicitly attributes rise to accessibility/purchasing power rather than supply availability, as secondary interpretation. Figure uses FAO2023 data and cannot be recomputed from newer2026 archive.

**Bruk i videre arbeid:** Replace tilgjengelighets-/inntektsrelatert with økonomisk tilgang/kjøpekraft; cite IFRO2024 interpretation, not a newly identified causal effect. Correct original PDF locator to5/7/9/28.

## A4-O005 — supported_with_limits

All7 component rows and total match transcription.70/15/15 are energy shares; animal protein sources assumed produced domestically, explicitly not proposed stock.

**Bruk i videre arbeid:** Say energy shares and continuous animal-food production assumption; do not translate table into stock-only inventory.

## A4-O006 — supported_with_limits

All27 reported values (7items+total+imported across3durations) visually/text checked as transcribed report totals. They are proposals/model outputs; domestic protein is production assumption. Dailybasket times population/days is not fully consistent with table:3week protein375g×450000×21 gives3543.75t, while source reports3455t.

**Bruk i videre arbeid:** Retain as source-reported, not independently validated calculation; do not infer existing reserves. Record arithmetic mismatch instead of silently recomputing source.

## A4-O008 — supported_with_limits

1week/3weeks/3months scenarios and no actual riskassessment explicitly stated.

**Bruk i videre arbeid:** Correct source locator printed2–3 to printed/PDF5.

## A4-O012 — supported_with_limits

Processing/distribution/sales explicitly excluded. This is central to why farmproduction scenario cannot show delivered consumerfood.

**Bruk i videre arbeid:** Correct source locator printed2–3 to printed/PDF5.

## A4-O014 — supported_with_limits

344tonnes sentence matches; table refers estimatedaverage from5largest farms,includes160maltbarley+5maltrye.408total includes64oil;344 excludesoil.

**Bruk i videre arbeid:** Specify estimatedannualgrain incl malting, not344tonnes staplefood flour available for households.

## A4-O017 — supported_with_limits

Both products present. Source explicitly defines haframjöl as cutthenrolledoats, not milledflour.

**Bruk i videre arbeid:** Replace finvalsede havregryn/havremel with finvalsede havregryn (haframjöl) og valsede helehavrekjerner (tröllahafrar).

## A4-O022 — contradicted

Product20kg/manufacturer verified. Explanatoryline says unavailable inwebshop and contact salesman; generalunavailability cannot be inferred.

**Bruk i videre arbeid:** Change availableForSaleAtRead:false to onlinePurchaseAvailableAtRead:false; general availability unknown.

## A4-O025 — supported_with_limits

Original is secondAMENDMENT to350/2024, notstandalone new foundinglaw. Revisedpurpose supportqualitygrain,drying,storageequipment;2026/27 funding reservation explicit.

**Bruk i videre arbeid:** Call915/2025 amendment toinvestment-supportregulation350/2024; do not imply allsupport/infrastructure established by915alone.

## A4-O028 — contradicted

Opened fullcommittee list puts19June opinion undercase251, not57;57 showsÓafgreitt. Freshcase57 process shows18Marchreferral/20Marchcommittee only. Originalhistoricalsearchsnippet notpreserved so cannot reconstruct howerror arose.

**Bruk i videre arbeid:** Remove19June2025 date fromcase57. Preserve historicallead separately; latestopened list showsunprocessed. Do not assert finaladoption.

## A1-O007 — supported_with_limits

40 500 tonn og 49 prosent er konsernets rapporterte avtaleportefølje. Brøken tilsvarer 82 500-tonnsmålet, og er ikke 49 prosent av observerte 30 000 tonn ved utgangen av 2025. Ny børsmeldingsversjon har relevant tekst på fysiskPDFside 25, ikke tidligere locator 24.

**Bruk i videre arbeid:** Oppgi avtalevolum 40 500 tonn; knytt 49 prosent til målvolum 82 500 med eksplisitt avledning, aldri til nåværende fysisk lager. Rett locator til ny PDF fysiskPDFside 25.

## A1-O012 — supported_with_limits

42 000 er første avgrensning, men investeringsbehov28 000/55 500 bruker senere27 000 etter Stavanger/Florø-forutsetningen. Original setning komprimerer to ulike trinn.

**Bruk i videre arbeid:** Skill42 000 tonn avgrenset historisk kapasitet fra27 000-tonnsscenarioet som brukes ved beregning av nytt behov28 000/55 500. Ikke trekk55 000 minus42 000 og sammenlign med28 000.

## A1-O014 — supported_with_limits

Teoretisk950 000 måles som bygg og ekskluderer Stavanger havnesilo; praktisk760 000 bygger på sorterings-/utnyttelsesforutsetninger.

**Bruk i videre arbeid:** Presiser bygg som måleenhet og at Stavanger havnesilo ikke inngår; ikke kall dette samlet all-norsk ledig kapasitet.

## A1-O015 — supported_with_limits

5 300 tonn/time er eksplisitt total TEORETISK mottakskapasitet; praksis lavere og ikke mathvetespesifikk.

**Bruk i videre arbeid:** Ta ordet teoretisk inn i selve påstanden, ikke bare metadata.

## A1-O016 — supported_with_limits

Kommunal kulturmiljøbeskrivelse oppgir to siloer med60.000 tonn. Nominell lagring, ingen faktisk beholdning eller ny dato.

**Bruk i videre arbeid:** Bruk fysisk PDFside4; opprinnelig locator trykt3 er ikke entydig mot ny fil.

## A1-O021 — insufficient_evidence

Rapporten sier har besluttet å samle/rendyrke og beskriver omstilling. Nåtidspåstand om fullført geografisk funksjonsdeling støttes ikke.

**Bruk i videre arbeid:** Norgesmøllene hadde besluttet å samle forbrukerpakking i Buvika, rendyrke bulk i Vaksdal og videreføre havre/spesial i Skien; gjennomføring må verifiseres separat.

## A1-O027 — insufficient_evidence

Samme temporale problem somO 021: planlagt/besluttet omstilling presenteres som gjennomført funksjonsdeling.

**Bruk i videre arbeid:** Samme korreksjon somO 021; marker dessuten atO 021/O 027 bygger på samme kildepassasje, ikke to uavhengige funn.

## A1-O037 — supported_with_limits

Den direkte lenkede mandat-PDF-en er nå hentet og lest: mottak, tørking, kjøling og lagring fra produsent til matmelmølle/kraftfôr står eksplisitt. Mandatet er datert 3.7.2026; nyhetssiden dokumenterer første møte i september. Sluttrapport skal leveres 15.3.2027.

**Bruk i videre arbeid:** Skill mandatdato 3.7.2026, første møtes nyhetsdato 3.9.2026 og rapportfrist 15.3.2027. Mandatet er ikke resultatet av kartleggingen.

## A2-O005 — supported_with_limits

Nettsiden sier over8millioner årlig, mens datert2025-rapport sier7,7. Begge utsagn finnes, men nettsiden er ikke et alternativt presist2025-estimat.

**Bruk i videre arbeid:** Bruk7,7 millioner liter for2025 og før over8millioner som udaterte nettopplysninger med uavklart tidsgrunnlag.

## A2-O011 — supported_with_limits

30kviger i blokker,12uker perblokk,0/10/20prosentDM og manglende signifikant forskjell stemmer. Fravær av signifikans er ikke generell ekvivalensgaranti.

**Bruk i videre arbeid:** Presiser12uker perblokk; hele forsøket strakte seg over10måneder. Konklusjonen gjelder balanserte forsøksrasjoner, ikke kg-for-kg generell erstatning.

## A2-O014 — insufficient_evidence

Kilden sier at forringelse kan oppstå allerede etter5–7dager, ikke at materialet får garantert5–7dagers holdbarhet.

**Bruk i videre arbeid:** Skriv kan begynne å forringes allerede5–7dager etter åpning, særlig i varmtFlorida-klima; lokal holdbarhet krever måling.

## A2-O018 — contradicted

Den opprinnelige observasjonsraden har sampleN=12. Abstractets resultater oppgir 12 dyr per behandling, med tre behandlinger:36 totalt. Tilvekstpåstanden støttes, men utvalgsstørrelsen i den hashbundne raden er feil.

**Bruk i videre arbeid:** Rett kandidatens sampleN fra 12 til 36 og skriv 3 replikater med 4 kviger PER behandling,3 behandlinger; bevar den opprinnelige raden som avvist på dette punktet.

## A2-O019 — insufficient_evidence

Kildene beskriver mask som skrus til silo og maltrest i rør til hentested. Pumpe er ikke dokumentert; rør/pumpe innfører et teknisk ledd uten kilde.

**Bruk i videre arbeid:** Bruk silkar→skrue→masksilo samt oppgitt rør til hentested; marker pumpe og konkret rør/silo-topologi som uavklart.

## A5-O003 — insufficient_evidence

Traktaten etablerer mulighet for protokoller, men de to Finlex-rutene leverer ikke substans nå. Denne kontrollen kan ikke bekrefte omfanget av alle historiske søk.

**Bruk i videre arbeid:** Før dette som tidligere rapportert avgrenset søkefunn med søkelogg, ikke fravær av avtaler. To nåværende Finlex-innholdsgap svekker full registerdekning.

## A5-O004 — supported_with_limits

Full originalPDF er nå lest påp59; teksten sier i kraft2006 og ikke anvendt. Dette oppgraderer tidligere søkeutdragsgrunnlag for den daterte2025-påstanden.

**Bruk i videre arbeid:** Oppdater lesestatus til relevant fulltekst og fjern gammel påstand om bare søkeutdrag. Ikke utvid anvendelsesstatus til september2026.

## A5-O008 — contradicted

Originalpåstanden kombinererOslo-forlengelsen i korridor2 med Göteborg–Hallsberg–Haparanda/Tornio i korridor3. Korridor3s forlengelse erBoden–Ofoten/Narvik.

**Bruk i videre arbeid:** Skill korridor2 Øresund/Trelleborg/Göteborg–Gävle/Stockholm–Hanko/Turku/Naantali medOslo fra korridor3 Göteborg–Hallsberg–Haparanda/Tornio–Oulu/Rovaniemi medBoden–Ofoten/Narvik.
