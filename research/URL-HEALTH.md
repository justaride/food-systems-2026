# URL Health — Food Systems 2026

> Auto-generert av `scripts/check-urls.ts` — ikke rediger manuelt.
> Generert: 2026-05-19T08:09:21.935Z
> Totalt sjekket: **600** unike URL-er
> Skanntid: **912.4s** (rate-limit 1000ms/req)

## Distribusjon per klassifikasjon

| classification | antall | %  |
|---|---:|---:|
| ok | 487 | 81.2% |
| redirect | 2 | 0.3% |
| dead | 51 | 8.5% |
| blocked | 38 | 6.3% |
| paywalled | 0 | 0.0% |
| timeout | 3 | 0.5% |
| server_error | 6 | 1.0% |
| other | 13 | 2.2% |

## Klassifikasjons-regler

- **ok**: HTTP 200
- **redirect**: HTTP 3xx (Location-feltet fulgt manuelt opp til 5 hopp)
- **dead**: HTTP 404 / 410, eller nettverksfeil (ENOTFOUND, ECONNREFUSED, ECONNRESET, EHOSTUNREACH)
- **blocked**: HTTP 403 / 451 (etter retry med GET-fallback)
- **paywalled**: TODO — krever innholdsanalyse, ikke implementert (alltid 0 i denne kjøringen)
- **timeout**: ingen respons innen 10s
- **server_error**: HTTP 5xx
- **other**: alt annet (1xx, 2xx ikke 200, 4xx ikke 403/404/410/451)

## Dead URLs (404 / 410 / nettverksfeil)

| priority | source | status | url |
|---|---|---|---|
| 5.0 | report_canonical:dt-samarbeidsklima-2025 | 404 | https://www.dagligvaretilsynet.no/rapporter-og-strategi |
| 5.0 | report_canonical:beredskap-nibio-selvforsyning-metode | error: ENOTFOUND | https://nibio.brage.unit.no/nibio-xmlui/bitstream/handle/11250/3105805/NIBIO_RAPPORT_2023_9_137.pdf |
| 5.0 | report_canonical:akademia-uib-kjopermakt | 404 | https://www.uib.no/en/persons/Tommy.Gabrielsen |
| 5.0 | report_canonical:nou-2013-6-god-handelsskikk | 404 | https://www.regjeringen.no/no/dokumenter/nou-2013-6/id723782/ |
| 5.0 | thesis:jacobsen-jansson-2022 | error: ENOTFOUND | https://openaccess.nhh.no/nhh-xmlui/handle/11250/3051794 |
| 5.0 | thesis:nguyen-hartmann-2024 | error: ENOTFOUND | https://openaccess.nhh.no/nhh-xmlui/handle/11250/3158950 |
| 5.0 | thesis:tallaksen-2022 | error: ENOTFOUND | https://uia.brage.unit.no/uia-xmlui/handle/11250/3008873 |
| 5.0 | thesis:vangelsten-2017 | 404 | https://nordopen.nord.no/nord-xmlui/handle/11250/2491452 |
| 5.0 | thesis:moe-2018 | error: ENOTFOUND | https://nmbu.brage.unit.no/nmbu-xmlui/handle/11250/2569075 |
| 5.0 | thesis:jevne-schiotz-2021 | error: ENOTFOUND | https://nmbu.brage.unit.no/nmbu-xmlui/handle/11250/2788657 |
| 5.0 | thesis:handlykken-2023 | error: ENOTFOUND | https://oda.oslomet.no/oda-xmlui/handle/11250/3101983 |
| 5.0 | thesis:hagan-2025 | 404 | https://trace.tennessee.edu/cgi/viewcontent.cgi?article=14738&context=utk_gradthes |
| 4.5 | thesis:barbakken-hausken-2006 | error: ENOTFOUND | https://openaccess.nhh.no/nhh-xmlui/handle/11250/167473 |
| 4.5 | thesis:sandanger-2012 | error: ENOTFOUND | https://openaccess.nhh.no/nhh-xmlui/handle/11250/166778 |
| 4.5 | thesis:gangstoe-2019 | 404 | https://beccle.no/files/2020/01/Susanne_Helen_Gangstoe_Masteroppgave.pdf |
| 4.5 | thesis:paschen-eriksen-2014 | error: ENOTFOUND | https://uia.brage.unit.no/uia-xmlui/handle/11250/276369 |
|  | report_canonical:danmark-groent-danmark-co2-avgift-2024 | 404 | https://fm.dk/nyheder/2024/juni/aftale-om-groent-danmark/ |
|  | document:bibliotek/master-phd-backlog-2026 | 404 | http://hdl.handle.net/11250/3148444 |
|  | document:bibliotek/akademia/internasjonalt/eat-lancet-scores-nordic-cohorts-2024 | 404 | https://doi.org/10.1016/S2542-5196(24)00050-5 |
|  | document:bibliotek/akademia/internasjonalt/multicriteria-meat-milk-alternatives-2024 | 404 | https://doi.org/10.1073/pnas.2402486121 |
|  | document:bibliotek/akademia/internasjonalt/agrifood-planetary-boundaries-disclosure-2025 | 404 | https://doi.org/10.5751/ES-2025 |
|  | document:bibliotek/akademia/nmbu/foods-of-norway-novel-feed-2024 | 404 | https://doi.org/10.1016/j.aquaculture.2024 |
|  | document:bibliotek/akademia/sifo/alfnes-schjoll-fordelsprogram-prisstatistikk-2025 | error: ENOTFOUND | https://oda.oslomet.no/sifo |
|  | document:bibliotek/akademia/sifo/sifo-plateforms-online-food-2024 | error: ENOTFOUND | https://oda.oslomet.no/plateforms |
|  | document:bibliotek/akademia/sifo/steinnes-climate-nudge-nordic-2023 | 404 | https://doi.org/10.1016/j.spc.2023 |
|  | document:bibliotek/dagligvaretilsynet/samarbeidsklima-2024 | 404 | https://www.dagligvaretilsynet.no/aktuelt/underskelsen-fra-2023-bekrefter-i-all-hovedsak-hovedfunnene-fra-2022-pxyrp |
|  | document:bibliotek/dagligvaretilsynet/veiledninger | 404 | https://www.dagligvaretilsynet.no/lover-og-regler |
|  | document:bibliotek/sirkularitet/lca-norsk-mat-database-2025 | 404 | https://doi.org/10.1080/16546628.2025 |
|  | document:evidence-pack/sirkular-konkurser/rest-oslo/michelin-profile | 404 | https://guide.michelin.com/gb/en/oslo-region/oslo/restaurant/rest |
|  | document:regulatory/dagligvaretilsynet-god-handelsskikk-2025 | 404 | https://www.dagligvaretilsynet.no/lov-om-god-handelsskikk |
|  | document:bibliotek/nordisk/finland-ruokastrategia-2040 | 404 | https://mmm.fi/ruokastrategia |
|  | document:bibliotek/nordisk/island-dagligvaremarked-2025 | 404 | https://en.samkeppni.is/competition_authority/ |
|  | document:bibliotek/nordisk/nordforsk-gronn-omstilling-matsystemer-2024 | 404 | https://www.nordforsk.org/green-transition |
|  | document:bibliotek/nordisk/sei-grenseoverskridende-klimarisiko-nordisk-2024 | 404 | https://www.sei.org/publications/transboundary-climate-risks-nordics |
|  | document:bibliotek/sirkularitet/carbon-footprint-food-meta-analysis-2025 | 404 | https://doi.org/10.1038/s41598-2025 |
|  | document:bibliotek/sirkularitet/insekt-industri-sirkulaer-biookonomi-2024 | 404 | https://doi.org/10.1186/s12302-024 |
|  | document:evidence-pack/offentlig/meld-st-11-selvforsyning-2024 | 404 | https://www.regjeringen.no/no/dokumenter/meld.-st.-11-20232024/id3033241/ |
|  | document:evidence-pack/offentlig/nou-2013-6-god-handelsskikk | 404 | https://www.regjeringen.no/no/dokumenter/nou-2013-6/id721978/ |
|  | document:external/coffee-forest/prd | error: ENOTFOUND | http://go/data-security-policy#data-classification |
|  | document:bibliotek/akademia/internasjonalt/environmental-sustainability-nordic-baltic-nnr-2024 | 404 | https://doi.org/10.1080/16546628.2024 |
|  | document:bibliotek/akademia/internasjonalt/sustainability-plant-based-sweden-2024 | 404 | https://doi.org/10.1038/s41467-024 |
|  | document:bibliotek/akademia/nmbu/brekken-regional-food-networks-2024 | error: ENOTFOUND | https://nmbu.brage.unit.no/ |
|  | sourcedoc:src-17 | 404 | https://www.norgesgruppen.no/om-oss/rapporter/ |
|  | sourcedoc:src-21 | error: ENOTFOUND | https://oda.oslomet.no/ |
|  | sourcedoc:src-22 | error: ENOTFOUND | https://openaccess.nhh.no/ |
|  | sourcedoc:src-26 | 404 | https://www.regjeringen.no/no/dokumenter/meld-st-11-20232024/id3033241/ |
|  | sourcedoc:src-54 | 404 | https://www.reitanretail.no/rapportering |
|  | sourcedoc:src-16 | 404 | https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-jordbruksomradet/ |
|  | sourcedoc:src-143 | 404 | https://www.ruokavirasto.fi/globalassets/etmv/ |
|  | sourcedoc:src-164 | 404 | https://www.regjeringen.no/no/tema/klima-og-miljo/forurensning/innsiktsartikler/sirkular-okonomi/id2861732/ |
|  | sourcedoc:src-142 | 404 | https://en.kfst.dk/media/51101 |

## Redirects med endret final_url (alle)

Totalt: 2, hvorav 1 med priority >= 4.0.

| priority | source | status | url -> final_url |
|---|---|---|---|
| 5.0 | report_canonical:pubmed-szulecka-2024 | 302 | https://doi.org/10.1002/gch2.202300265 -> https://onlinelibrary.wiley.com/action/oidcCallback?idpCode=connect&error=login_required&error_description=Non%2BHuman%2BClient%2B1 |
|  | document:bibliotek/akademia/internasjonalt/kjopermakt-teori-empiri | 302 | https://doi.org/10.1023/A:1015268420311 -> https://link.springer.com/article/10.1023/A:1015268420311?error=cookies_not_supported&code=720fba9a-0561-4828-bc04-b6abbfc86157 |

## Blocked (403 / 451)

| priority | source | status | url |
|---|---|---|---|
| 5.0 | report_canonical:se-konkurrensverket-2024-5 | 403 | https://www.konkurrensverket.se/informationsmaterial/rapportlista/konkurrensverkets-genomlysning-av-livsmedelsbranschen-20232024/ |
| 5.0 | report_canonical:konkurrensverket-2025-5-livsmedelsutredning | 403 | https://www.konkurrensverket.se/konkurrens/samlad-kunskap-om-konkurrens/genomlysning-av-livsmedelsbranschen/ |
| 5.0 | thesis:stein-2022 | 403 | https://salford-repository.worktribe.com/output/1322952/sustainable-food-procurement-in-public-catering-comparison-of-the-uk-with-denmark-sweden |
| 4.5 | report_canonical:norden-policy-2024 | 403 | https://pub.norden.org/nord2024-007/index.html |
| 4.5 | thesis:burgherr-2019 | 403 | https://skemman.is/handle/1946/32307 |
| 4.5 | thesis:sigurdardottir-2017 | 403 | https://skemman.is/handle/1946/26754 |
| 4.5 | thesis:johannsson-2011 | 403 | https://skemman.is/bitstream/1946/7794/3/OrriJohannsson%20FoodSecurity%20Final.pdf |
|  | report_canonical:normo-2025-nordic-monitoring | 403 | https://www.norden.org/en/publication/normo-2025-nordic-monitoring-2014-2024 |
|  | report_canonical:karlstad-declaration-matberedskap-2024 | 403 | https://www.norden.org/no/declaration/karlstaddeklarasjonen |
|  | document:bibliotek/akademia/internasjonalt/eat-lancet-2025-commission | 403 | https://www.thelancet.com/commissions-do/EAT-2025 |
|  | document:bibliotek/akademia/nhh-food/foros-size-based-price-discrimination-2025 | 403 | https://onlinelibrary.wiley.com/doi/10.1111/joie.12420 |
|  | document:bibliotek/akademia/nhh-food/evensen-steen-co-location-2024 | 403 | https://doi.org/10.1093/jeea/jvad074 |
|  | document:bibliotek/akademia/internasjonalt/food-regime-theory-overview | 403 | https://www.tandfonline.com/doi/full/10.1080/03066150902820354 |
|  | document:bibliotek/akademia/pubmed/parra-lopez-c-2026-enabling-the-circular-food-economy | 403 | https://doi.org/10.1111/1541-4337.70431 |
|  | document:bibliotek/samisk/samisk-matsuverenitet | 403 | https://www.researchgate.net/publication/342900511_Sami_Identity_and_Traditional_Livelihood_Practices_From_Non-Indigenous_to_Indigenous_Food_Frameworks |
|  | document:bibliotek/akademia/masteroppgaver/johannsson-2011 | 403 | https://hdl.handle.net/1946/7794 |
|  | document:bibliotek/arbeidsliv/gig-okonomi-matleveranse | 403 | https://pub.norden.org/temanord2024-531/chapter-5-the-bitter-aftertaste-of-app-based-food-delivery.html |
|  | document:external/fjls-cooperation-programme-2025-2030 | 403 | https://pub.norden.org/politiknord2024-749/political-priorities.html |
|  | document:bibliotek/akademia/nhh-food/rrukaj-steen-asymmetric-pricing-2024 | 403 | https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4851998 |
|  | document:regulatory/eu-farm-to-fork-strategy-2020 | 403 | https://food.ec.europa.eu/horizontal-topics/farm-fork-strategy_en |
|  | document:regulatory/eu-fsfs-rammelov-baerekraftige-matsystemer-2023 | 403 | https://food.ec.europa.eu/horizontal-topics/farm-fork-strategy/legislative-framework_en |
|  | document:bibliotek/forskningsrunde-2026-04-20/alternative-distribusjonskanaler-norden-2026-04-20 | 403 | https://www.emerald.com/qmr/article/24/3/341/360963/Practicing-mundane-consumer-resistance-in-the-REKO |
|  | document:evidence-pack/nordisk/konkurrensverket-2024-4-dagligvaruhandelns-etablering | 403 | https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-4.pdf |
|  | document:evidence-pack/tilsyn/dagligvarerapport-2024 | 403 | https://konkurransetilsynet.no/wp-content/uploads/2022/ |
|  | document:evidence-pack/nordisk/konkurrensverket-summary-2024 | 403 | https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-5_summary.pdf |
|  | document:bibliotek/arbeidsliv/butikkansatte-arbeidsvilkaar-norden | 403 | https://pub.norden.org/temanord2021-503/ |
|  | document:bibliotek/nordisk/cop30-nordisk-deklarasjon-matsystemer-2025 | 403 | https://www.norden.org/no/declaration/cop30-food-systems |
|  | document:bibliotek/nordisk/nordic-food-innovation-summit-2024 | 403 | https://www.norden.org/en/publication/takeaways-nordic-food-innovation-summit |
|  | document:bibliotek/nordisk/oecd-agricultural-policy-norway-2025 | 403 | https://www.oecd.org/en/publications/agricultural-policy-monitoring-and-evaluation-2025_a80ac398-en/full-report/norway_d0127724.html |
|  | document:bibliotek/nordisk/oecd-konkurranse-matforsyningskjede-2024 | 403 | https://www.oecd.org/competition/competition-in-food-supply-chains.htm |
|  | document:bibliotek/sirkularitet/regenerativt-landbruk-norden | 403 | https://www.norden.org/en/publication/nordic-food-transition |
|  | document:bibliotek/sirkularitet/matsvinn-barrierer-nordiske-losninger-2024 | 403 | https://www.norden.org/en/publication/breaking-barriers-food-waste |
|  | document:ocr-output/pdf-downloads-20-04-26__what-does-it-take-to-close-the-loop_-lessons-from-a-successful-citrus-waste-valorisation-business-_-british-food-journal-_-emerald-publishing | 403 | https://www.emerald.com/insight/0007-070X |
|  | document:bibliotek/akademia/internasjonalt/matsikkerhet-beredskap-global | 403 | https://doi.org/10.1111/cjag.12279 |
|  | document:external/vision-2030-status-report-2023 | 403 | https://www.norden.org/en/publication/nordic-region-sustainable-and-integrated-region-our-vision-2030-status-report-2023 |
|  | document:external/vision-2030-action-plan | 403 | https://www.norden.org/en/information/action-plan-vision-2030 |
|  | sourcedoc:src-25 | 403 | https://www.konkurrensverket.se/publikationer/ |
|  | sourcedoc:src-93 | 403 | https://doi.org/10.1787/59cf6c95-en |

## Timeouts

| priority | source | url |
|---|---|---|
| 5.0 | thesis:schuler-2017 | https://research.cbs.dk/da/studentProjects/4d595881-09e8-4903-a8ee-8884cb878a8b |
|  | sourcedoc:src-72 | https://doi.org/10.18174/638397 |
|  | sourcedoc:src-170 | https://doi.org/10.18174/563389 |

## Server errors (5xx)

| priority | source | status | url |
|---|---|---|---|
| 5.0 | report_canonical:kkv-fi-4a-dominans | 500 | https://www.kkv.fi/en/facts-and-advice/competition-affairs/abuse-of-dominant-position/maaraava-markkina-asema-paivittaistavarakaupassa/ |
| 5.0 | report_canonical:ica-gruppen-annual-report-2024 | 503 | https://www.icagrupp.se/en/archive/press-archive/2025/ica-gruppen-publishes-annual-report-for-2024/ |
|  | document:bibliotek/media/snapshots/fi-kkv-food-market-study-2023 | 500 | https://www.kkv.fi/en/current/news/fcca-studies-the-functioning-of-the-food-market/ |
|  | document:evidence-pack/nordisk/kkv-sok-stockmann-2017 | 500 | https://www.kkv.fi/ |
|  | document:bibliotek/nordisk/finland-4a-dominans-haandheving | 500 | https://www.kkv.fi/en/current/press-releases/competition-act-provision-on-grocery-trade-became-effective-on-1st-of-january/ |
|  | sourcedoc:src-24 | 500 | https://www.kkv.fi/en/ |

## Other / uklassifisert

| priority | source | status | url |
|---|---|---|---|
| 5.0 | report_canonical:eu-utp-report-2024 | 202 | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A52024DC0176 |
| 5.0 | report_canonical:eu-utp-staff-working-doc-2024 | 202 | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A52024SC0106 |
| 5.0 | thesis:sedwall-2025 | 429 | http://www.diva-portal.org/smash/get/diva2:1966137/FULLTEXT01.pdf |
| 5.0 | thesis:zakeri-lei-2024 | 429 | https://uu.diva-portal.org/smash/get/diva2:1872486/FULLTEXT01.pdf |
| 5.0 | thesis:bojo-2023 | 429 | https://kth.diva-portal.org/smash/get/diva2:1802630/FULLTEXT01.pdf |
|  | document:bibliotek/akademia/internasjonalt/tysk-nachfragemacht-kjopermakt | 400 | https://www.bundeskartellamt.de/SharedDocs/Publikation/DE/Sektoruntersuchungen/Sektoruntersuchung%20LEH-Zusammenfassung.html |
|  | document:bibliotek/akademia/internasjonalt/tysk-dagligvaremarked-struktur | 400 | https://www.bundeskartellamt.de/SharedDocs/Meldung/EN/Pressemitteilungen/2014/24_09_2014_SU_LEH.html |
|  | document:evidence-pack/sirkular-konkurser/dug-foodtech/aarsredovisning-2024 | 202 | https://www.allabolag.se/ |
|  | document:bibliotek/sirkularitet/ppwr-emballasje-norsk-matsektor | 202 | https://eur-lex.europa.eu/EN/legal-content/summary/packaging-and-packaging-waste-from-2026.html |
|  | document:regulatory/eu-utp-directive-2019-633 | 202 | https://eur-lex.europa.eu/eli/dir/2019/633/oj/eng |
|  | document:regulatory/eu-utp-evaluering-desember-2025 | 202 | https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:52025DC0728 |
|  | document:bibliotek/akademia/masteroppgaver/hagan-2025 | 429 | https://trace.tennessee.edu/handle/20.500.14382/35461 |
|  | sourcedoc:src-155 | 202 | https://ui.adsabs.harvard.edu/abs/2021RCR...16405218K/abstract |

## Notater

- URL-listen leses fra `research/URL-INVENTORY.csv` (deduplisert per URL, høyeste source_priority beholdes).
- HEAD brukes først; GET-fallback ved 403/405. Redirect (3xx) følges manuelt opp til 5 hopp for å fange `final_url`.
- `paywalled` er ikke implementert i denne versjonen — krever innholdsanalyse av 200-respons. TODO.
- Rate-limit: 1 req/sek for å være høflig mot kildene. Tidsavbrudd: 10s per request.
- Bruk `tsx scripts/check-urls.ts --csv-only` for å undertrykke per-URL konsoll-logging.
- ENOTFOUND mot `brage.unit.no`-aliaser (`openaccess.nhh.no`, `nmbu.brage.unit.no`, `uia.brage.unit.no`, `oda.oslomet.no`, `nibio.brage.unit.no`) skyldes at canonical-domenet `brage.unit.no` ikke resolverer for øyeblikket — dette kan være transient DNS, men er flagget som `dead` her fordi URL-en ikke kan brukes i RAG-pipelinen før det fikses.
