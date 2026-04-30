# Nordic Vision 2030: indikator-gap mot Food Systems 2026

**Dato:** 2026-04-29  
**Status:** Første indikator-diff  
**Kildegrunnlag:** Nordic Council of Ministers, `Nordic indicators for Our Vision 2030` (PolitikNord 2021:723), kontrollert mot lokale prosjektdata 2026-04-29.  
**Avgrensning:** NMR-indikatorene er laget som nordiske aggregatindikatorer. Food Systems 2026 har primært land-, verdikjede- og aktørdata. Det betyr at vi ofte kan supplere Vision 2030, men ikke alltid gjenskape NMRs indikator direkte.

## Kort konklusjon

NMRs Vision 2030-indikatorer dekker bærekraft bredt, men bare noen få er direkte matsystemspesifikke. Food Systems 2026 har derfor to roller:

1. **Direkte utfylling:** mat, avfall, landbruk, handel, produksjon, selvforsyning og markedskonsentrasjon.
2. **Matsystem-fortolkning:** koble brede indikatorer som utslipp, materialfotavtrykk, helse, ulikhet og sysselsetting til konkrete matsystemmekanismer.

Det største gapet er ikke data generelt, men koblingen mellom NMRs brede indikatorramme og de matnære indikatorene prosjektet allerede har.

## Lokal datadekning som er kontrollert

| Datakilde | Dekning |
|---|---|
| `CountryMetric` | 414 rader i DB. Dekker bl.a. `ghgEmissions`, `foodWaste`, `foodWastePerCapita`, `hhi`, `retailerShare`, `selfSufficiency`, `landUse`, `privateLabel`, `organicAgriculture`, `intraNordicImportShare`, `dietFrequency` og `healthOutcome`. |
| `research/data/nordic/analysis-panel/` | 20 serier: HICP matpris, total handel, havreproduksjon og enkelte fallback-serier. |
| `research/data/nordic/trade-groups/` | Importpanel for NO/DK/SE/FI/IS og seks matvaregrupper: kjøtt, meieri/egg, sjømat, korn, frukt/grønt, fett/oljer. |
| `research/norden/verdikjede/` | Komparative analyser av verdikjede, konsentrasjon, flaskehalser og systemrisiko. |
| `research/bibliotek/nordisk/` | Kuraterte notater for NORMO, NNR, NordForsk, Food Innovation Summit og andre nordiske kilder. |

## Gap-matrise per NMR-fokusområde

| NMR-fokusområde | Relevante NMR-indikatorer | Matrelevans | Prosjektdekning nå | Gap / neste handling |
|---|---|---|---|---|
| Climate action | territoriale utslipp, forbruksbaserte utslipp, arktisk is | Høy for produksjon, import, kjøtt/meieri, fôr, matsvinn | `CountryMetric.ghgEmissions` finnes, sterkest for Norge; enkelte landprofiler | Mangler forbruksbasert matfotavtrykk og harmoniserte landbruksutslipp per land |
| Affordable and clean energy | fornybar energi, energiintensitet, energirelaterte utslipp | Medium for foredling, logistikk, biogass | Fragmentert i bioøkonomi/biogassnotater | Bygg biogass- og energibruk-source pack per land |
| Responsible consumption and production | materialfotavtrykk, kommunal resirkulering, eco-labels | Høy for sirkularitet, emballasje, matsvinn, forbruk | Matsvinn per-capita finnes for DK/FI/IS/NO/SE i `CountryMetric`; Norge har leddvis serie og Sverige har 2024 butikk-/konsumentledd; ingen samlet materialfotavtrykk | Hent material footprint og harmoniser leddvis matsvinn for DK/FI/IS før ekstern verdikjedeclaim |
| Life on land | beskyttet land, økologisk landbruksareal, jordbruksfugl | Høy for arealbruk, økologi, biodiversitet | `organicAgriculture` er integrert i `CountryMetric` for DK/FI/NO/SE; Island holdes som `needs_primary_check` | Neste hull er biodiversitetsproxy og primærkilde for Island |
| Life below water | marine verneområder, eutrofiering, fiskebestander | Høy for sjømat, fôr, avrenning, Oslofjord/Østersjø | Sjømat- og NPK-notater; ingen strukturert indikatorpakke | Lag akvatisk matsystempakke: eutrofiering, fiskebestander, akvakultur, fôr |
| Quality education | utdanning, frafall, voksenopplæring | Lav direkte, medium for kompetanseomstilling | Ikke matspesifikt dekket | Hold som kontekst med mindre arbeidskraft/kompetanse blir eget spor |
| Decent work and economic growth | sysselsetting, circular/bioeconomy employment, GDP | Medium for bioøkonomi, arbeidsliv og grønn verdiskaping | Arbeidslivsnotater finnes; ingen strukturert bioøkonomisysselsetting | Hent sysselsetting i bioøkonomi/sirkulær økonomi hvis prosjektet skal måle konkurransekraft |
| Industry, innovation and infrastructure | FoU, miljøpatenter, digital indeks | Medium for foodtech, data og innovasjon | NordForsk/NKJ/Food Innovation-notater; ikke indikatorisert | Bruk som policykontekst; ikke prioriter før kildestatus er ryddet |
| Sustainable cities and communities | kollektivtransport, luftpartikler, offentlige rom | Lav direkte, medium for offentlige måltider/kommunale matsystemer | HORECA/offentlige måltider finnes, men ikke koblet til NMR-indikatorene | Ikke direkte Vision-måling; bruk heller som lokal matmiljø-/innkjøpsflate |
| Freedom of movement | intra-nordisk migrasjon, nordisk importandel, pendling | Medium for integrasjon og regional handel | Intra-nordisk importandel er integrert som all-country `CountryMetric.intraNordicImportShare` for valgt matkurv | Neste hull er metode-/indikatornote og eventuell gruppevis oppdeling |
| Good health and well-being | levealder, egenvurdert helse, forebyggbar dødelighet | Høy indirekte via kosthold, fedme og matmiljø | NNR2023 er DB-lenket som Report + SourceDoc + PDF-Document; NORMO 2025 er førsteuttrukket til 57 `CountryMetric`-rader for adult diet frequency og adult/child overweight-obesity | Neste hull er aktivitet, sosial ulikhet og eventuelt barnas fullstendige dietttabeller dersom sosial bærekraft prioriteres |
| Gender equality | kjønnsdelt arbeidsmarked, permisjon, parlament | Medium for arbeidsliv og matbransje | Kjønn/matarbeid-notat finnes | Eget sosial bærekraftspor hvis relevant; ikke kjerne for første Vision-brief |
| Reduced inequalities | Gini, fattigdom/utenforskap, migrantledighet | Medium/høy for mattilgang og prispress | HICP matpris finnes; matfattigdom-notater finnes | Koble matpris, lavinntekt og tilgang; mangler strukturerte food affordability-data |
| Peace, justice, institutions | sosial tillit, valgdeltakelse, trygghet | Lav direkte, medium for nordisk samarbeidsmodell | Ikke matspesifikt dekket | Hold som kontekst |
| Strong cultural scene | kulturhandel, offentlig kulturutgift, husholdningskulturutgift | Lav direkte | Ikke relevant for Food Systems 2026 | Utenfor scope |

## Prosjektindikatorer som supplerer NMR

Disse finnes eller er delvis strukturert i prosjektet, men ligger ikke tydelig i NMRs 45 indikatorer:

| Prosjektindikator | Hvorfor viktig for Vision 2030-fortolkning |
|---|---|
| HICP matpris per land | Viser press på husholdninger og mattilgang, relevant for sosial bærekraft |
| Matvaregruppeimport | Viser importavhengighet, robusthet og handelsmønster |
| Selvforsyning | Direkte relevant for beredskap og resilient matsystem |
| HHI og retailer share | Viser markedsstruktur og konkurransekraft i matsystemet |
| Matsvinn og matsvinn per capita | Direkte relevant for ressursbruk og avfallsforebygging |
| Private label / EMV | Relevant for makt, sortiment og konkurranse |
| Havreproduksjon | Smal, men konkret proxy for plantebasert produksjonskapasitet i FI/NO/SE |
| Verdikjede-flaskehalser | Forklarer hvorfor brede Vision-mål kan stoppe i konkrete markedsstrukturer |

## Prioritert neste datakø

| Prioritet | Datapakke | Handling |
|---|---|---|
| P1 | NMR Vision indicators | Utført i `research/norden/nordic-vision-2030-indicator-map-2026-04-29.csv`; bruk CSV-en som datakø |
| P1 | `src-92` og offisielle NMR-kilder | Refresh DB-kobling og arkiver fulltekst/PDF før ekstern brief |
| P1 | NORMO 2025 / NNR 2023 | Utført første integrasjon: NNR er DB-lenket til PDF-Document; NORMO Appendix 6 er arkivert og 57 CountryMetric-rader er upsertet |
| P1 | Matsvinn per land | Første coverage-snapshot er utført fra `CountryMetric`; neste er harmonisert leddvis primæruttrekk for DK/FI/IS |
| P1 | Landbruksutslipp og forbruksbasert matfotavtrykk | Kildebind utslipp per land og sektor |
| P2 | Biogass og sidestrømmer | Bygg bioøkonomiindikatorer: råstoff, kapasitet, produksjon, verdihierarki |
| P2 | Intra-nordisk matimport | Utført som all-country `CountryMetric.intraNordicImportShare`; eventuell gruppevis oppdeling er neste forbedring |
| P2 | Økologisk landbruksareal | Utført som `CountryMetric.organicAgriculture`; Island står fortsatt med primærkilde-forbehold |
| P2 | Arbeidsliv/sosial bærekraft | Avklar om arbeidsvilkår skal inn i Vision-brief eller holdes separat |

## Anbefalt bruk

I første beslutningsbrief bør Vision 2030 ikke fremstilles som en matsystemfasit. Den bør brukes som et styrende policyanker. Food Systems 2026 bør bidra med det NMR-indikatorene ikke gjør godt nok alene: landspesifikk, verdikjedespesifikk og aktørnær forklaring på hvorfor grønn, konkurransedyktig og sosialt bærekraftig matsystemomstilling lykkes eller stopper.
