# Nedlastingsresultat — Fase B1

> AUTO-GENERERT av `scripts/build-download-report.ts` — ikke rediger manuelt.
> Generert: 2026-04-09T14:10:30.044Z
> Kilde: `research/download-log-2026-04-09.jsonl`

## Sammendrag

| Status | Antall | Beskrivelse |
|---|---:|---|
| `downloaded` | 24 | PDF lastet ned og lagret |
| `duplicate` | 3 | SHA256-match mot eksisterende fil i arkiv |
| `skipped` | 1 | Allerede i seed-pdf-map eller target eksisterte |
| `requires_manual` | 72 | Ingen PDF-URL kunne løses automatisk |
| `failed` | 24 | Nedlasting feilet (HTTP-feil, timeout, ikke-PDF) |
| **Totalt** | **124** | |

**Bytes nedlastet:** 68.9 MB

## Nedlastet (24)

| ID | Størrelse | Lokal fil |
|---|---:|---|
| `nou-2022-14` | 4371 KB | `evidence-pack/offentlig/nou-2022-14.pdf` |
| `oslo-economics-forsvar-2024` | 762 KB | `evidence-pack/konsulentrapport/oslo-economics-forsvar-2024.pdf` |
| `fivh-etikk-2025` | 2591 KB | `evidence-pack/tenketank/norsus-matvett-kartleggingsrapport-matbransjen-undervisning-omsorg-forbrukerleddet-or48-21.pdf` |
| `stockholm-resilience-2019` | 6914 KB | `evidence-pack/tenketank/stockholm-resilience-2019.pdf` |
| `akademia-sifo-kundeprogram-2026` | 5718 KB | `evidence-pack/akademia/akademia-sifo-kundeprogram-2026.pdf` |
| `akademia-nhh-foros-media-2025` | 769 KB | `evidence-pack/akademia/akademia-nhh-foros-media-2025.pdf` |
| `brancoli-phd-2021` | 3919 KB | `evidence-pack/akademia/brancoli-phd-2021.pdf` |
| `lehtokunnas-phd-2023` | 7799 KB | `evidence-pack/akademia/lehtokunnas-phd-2023.pdf` |
| `kayhan-ronnback-2019` | 945 KB | `evidence-pack/akademia/kayhan-ronnback-2019.pdf` |
| `hasle-tjostheim-2024` | 4398 KB | `evidence-pack/akademia/hasle-tjostheim-2024.pdf` |
| `lindstrom-phd-2021` | 468 KB | `evidence-pack/akademia/lindstrom-phd-2021.pdf` |
| `adlers-2022` | 1452 KB | `evidence-pack/akademia/adlers-2022.pdf` |
| `nikolaev-2023` | 2511 KB | `evidence-pack/akademia/nikolaev-2023.pdf` |
| `khandaker-2021` | 3648 KB | `evidence-pack/akademia/khandaker-2021.pdf` |
| `sturen-2023` | 2312 KB | `evidence-pack/akademia/sturen-2023.pdf` |
| `tanderup-rasmussen-hansen-2023` | 3472 KB | `evidence-pack/akademia/tanderup-rasmussen-hansen-2023.pdf` |
| `jorgensen-ahmadi-2024` | 1133 KB | `evidence-pack/akademia/jorgensen-ahmadi-2024.pdf` |
| `mattila-2024` | 3015 KB | `evidence-pack/akademia/mattila-2024.pdf` |
| `makela-2023` | 1106 KB | `evidence-pack/akademia/makela-2023.pdf` |
| `ortiz-cuadra-2023` | 3041 KB | `evidence-pack/akademia/ortiz-cuadra-2023.pdf` |
| `stahl-2024` | 876 KB | `evidence-pack/akademia/stahl-2024.pdf` |
| `zakeri-lei-2024` | 4568 KB | `evidence-pack/akademia/zakeri-lei-2024.pdf` |
| `duong-2025` | 781 KB | `evidence-pack/akademia/duong-2025.pdf` |
| `src-73` | 3983 KB | `evidence-pack/offentlig/src-73.pdf` |

## Duplikater (3)

| ID | Eksisterer som |
|---|---|
| `meld-st-4-dagligvare` | `evidence-pack/offentlig/meld-st-4-2024-2025-dagligvare.pdf` |
| `soa-emv-2023` | `evidence-pack/offentlig/emv-kartlegging-2023.pdf` |
| `src-13` | `evidence-pack/offentlig/nou-2022-14.pdf` |

## Feilet (24)

| ID | Feil | URL |
|---|---|---|
| `menon-emv-innovasjon` | not a PDF (missing %PDF magic) | `https://www.menon.no/wp-content/uploads/2022-68-EMV-og-innovasjon-i-dagligvare.pdf` |
| `beredskap-nibio-selvforsyning-metode` | fetch failed | `https://nibio.brage.unit.no/nibio-xmlui/bitstream/handle/11250/3105805/NIBIO_RAPPORT_2023_9_137.pdf` |
| `albizzati-phd-2021` | HTTP 403 | `https://orbit.dtu.dk/en/publications/sustainability-assessment-of-food-waste-management` |
| `deljanin-2015` | not a PDF (missing %PDF magic) | `http://studenttheses.cbs.dk/bitstream/handle/10417/5762/sarah_roxenne_deljanin.pdf?sequence=1` |
| `storm-teigland-2017` | HTTP 403 | `https://research.cbs.dk/en/studentProjects/f94eaa1d-15c1-404b-8e1b-b7ce56fe317d` |
| `schuler-2017` | HTTP 403 | `https://research.cbs.dk/da/studentProjects/4d595881-09e8-4903-a8ee-8884cb878a8b` |
| `minkeviciute-2019` | HTTP 403 | `https://research.cbs.dk/en/studentProjects/assessment-of-grocery-ecommerce-in-scandinavia` |
| `nielsen-andersen-2016` | HTTP 403 | `https://research.cbs.dk/en/studentProjects/danish-grocery-retail-does-preference-structure-influence-the-per` |
| `johannsson-2011` | HTTP 403 | `https://skemman.is/bitstream/1946/7794/3/OrriJohannsson%20FoodSecurity%20Final.pdf` |
| `sedwall-2025` | HTTP 429 | `http://www.diva-portal.org/smash/get/diva2:1966137/FULLTEXT01.pdf` |
| `segersven-2024` | HTTP 400 | `https://urn.fi/URN:NBN:fi-fe2024043024001` |
| `menon-emv-innovasjon` | not a PDF (missing %PDF magic) | `https://www.menon.no/wp-content/uploads/2022-68-EMV-og-innovasjon-i-dagligvare.pdf` |
| `beredskap-nibio-selvforsyning-metode` | fetch failed | `https://nibio.brage.unit.no/nibio-xmlui/bitstream/handle/11250/3105805/NIBIO_RAPPORT_2023_9_137.pdf` |
| `albizzati-phd-2021` | HTTP 403 | `https://orbit.dtu.dk/en/publications/sustainability-assessment-of-food-waste-management` |
| `deljanin-2015` | not a PDF (missing %PDF magic) | `http://studenttheses.cbs.dk/bitstream/handle/10417/5762/sarah_roxenne_deljanin.pdf?sequence=1` |
| `storm-teigland-2017` | HTTP 403 | `https://research.cbs.dk/en/studentProjects/f94eaa1d-15c1-404b-8e1b-b7ce56fe317d` |
| `schuler-2017` | HTTP 403 | `https://research.cbs.dk/da/studentProjects/4d595881-09e8-4903-a8ee-8884cb878a8b` |
| `minkeviciute-2019` | HTTP 403 | `https://research.cbs.dk/en/studentProjects/assessment-of-grocery-ecommerce-in-scandinavia` |
| `nielsen-andersen-2016` | HTTP 403 | `https://research.cbs.dk/en/studentProjects/danish-grocery-retail-does-preference-structure-influence-the-per` |
| `johannsson-2011` | HTTP 403 | `https://skemman.is/bitstream/1946/7794/3/OrriJohannsson%20FoodSecurity%20Final.pdf` |
| `sedwall-2025` | HTTP 429 | `http://www.diva-portal.org/smash/get/diva2:1966137/FULLTEXT01.pdf` |
| `segersven-2024` | HTTP 400 | `https://urn.fi/URN:NBN:fi-fe2024043024001` |
| `feng-l-2023-developing-a-biogas-centralised-circular` | fetch failed | `https://doi.org/10.1016/j.scitotenv.2023.161656` |
| `src-72` | not a PDF (missing %PDF magic) | `https://doi.org/10.18174/638397` |

## Krever manuell innhenting (72)

Disse oppføringene har en landing page eller hub-side hvor automatisk scraping ikke fant en spesifikk PDF. Mange er NHH/Brage-theses som har migrert til `nva.sikt.no` — dette arkivet krever autentisering for nedlasting og må hentes manuelt via browser.

| ID | URL |
|---|---|
| `matsystemutvalget-2026` | `https://nettsteder.regjeringen.no/matsystemutvalget/` |
| `kt-markedsundersokelser-2026` | `https://www.regjeringen.no/no/aktuelt/i-dag-far-konkurransetilsynet-et-nytt-verktoy-for-a-bekjempe-alvorlige-konkurranseproblemer/id3113837/` |
| `kkv-fi-4a-dominans` | `https://www.kkv.fi/en/facts-and-advice/competition-affairs/abuse-of-dominant-position/maaraava-markkina-asema-paivittaistavarakaupassa/` |
| `is-markedsstruktur-2024` | `https://www.samkeppni.is/urlausnir/skyrslur/` |
| `asko-infrastruktur-2025` | `https://asko.no/en/about-us/` |
| `dagligvarerapporten-2025` | `https://www.virke.no/analyse/statistikk-rapporter/dagligvarehandelen/` |
| `nbs-systemkritikk` | `https://www.smabrukarlaget.no/politikk/mat-og-produksjon/` |
| `civita-manifest-debatt` | `https://civita.no/okonomi/naeringspolitikk/svak-konkurranse-som-fortjent/` |
| `norden-policy-2024` | `https://pub.norden.org/nord2024-007/index.html` |
| `beredskap-finsk-modell-hvk` | `https://www.huoltovarmuuskeskus.fi/en/security-of-supply` |
| `sirkularitet-definisjoner-wur-emf` | `https://www.ellenmacarthurfoundation.org/topics/food/overview` |
| `juridisk-eiendomsmakt-lokal-konkurranse` | `https://www.regjeringen.no/no/aktuelt/forbyr-praksis-som-motvirker-konkurranse-i-dagligvaremarkedet/id2985486/` |
| `juridisk-eudr-norge-2025` | `https://www.landbruksdirektoratet.no/nb/skogbruk/eus-avskogingsforordning-eudr` |
| `akademia-sifo-retail-media-2025` | `https://www.oslomet.no/om/sifo/publikasjoner` |
| `akademia-nhh-butikkstruktur-2024` | `https://www.nhh.no/en/research-centres/food/` |
| `akademia-uib-kjopermakt` | `https://www.uib.no/en/persons/Tommy.Gabrielsen` |
| `nguyen-hartmann-2024` | `https://openaccess.nhh.no/nhh-xmlui/handle/11250/3158950` |
| `barbakken-hausken-2006` | `https://openaccess.nhh.no/nhh-xmlui/handle/11250/167473` |
| `sandanger-2012` | `https://openaccess.nhh.no/nhh-xmlui/handle/11250/166778` |
| `kronqvist-2010` | `https://aaltodoc.aalto.fi/handle/123456789/523` |
| `hebrok-phd-2020` | `https://hdl.handle.net/11250/2676125` |
| `eriksson-phd-2015` | `https://pub.epsilon.slu.se/12756/` |
| `sundin-phd-2024` | `https://pub.epsilon.slu.se/34408/` |
| `sundqvist-phd-2025` | `https://helda.helsinki.fi/items/2a30bdde-510d-4aa1-8641-f57183b51a6a` |
| `esposito-2022` | `https://bora.uib.no/bora-xmlui/handle/11250/3010552` |
| `burgherr-2019` | `https://skemman.is/handle/1946/32307` |
| `sigurdardottir-2017` | `https://skemman.is/handle/1946/26754` |
| `stein-2022` | `https://salford-repository.worktribe.com/output/1322952/sustainable-food-procurement-in-public-catering-comparison-of-the-uk-with-denmark-sweden` |
| `steien-2016` | `https://munin.uit.no/handle/10037/10932` |
| `orlova-2019` | `https://bora.uib.no/bora-xmlui/handle/1956/20623` |
| `morken-2015` | `https://bora.uib.no/bora-xmlui/handle/1956/10899` |
| `simonsen-2017` | `https://ntnuopen.ntnu.no/ntnu-xmlui/handle/11250/2456020` |
| `granlund-lindskog-2024` | `https://ntnuopen.ntnu.no/ntnu-xmlui/handle/11250/3156088` |
| `sandbraaten-2023` | `https://www.duo.uio.no/handle/10852/103341` |
| `vangelsten-2017` | `https://nordopen.nord.no/nord-xmlui/handle/11250/2491452` |
| `moe-2018` | `https://nmbu.brage.unit.no/nmbu-xmlui/handle/11250/2569075` |
| `jevne-schiotz-2021` | `https://nmbu.brage.unit.no/nmbu-xmlui/handle/11250/2788657` |
| `tesdal-2013` | `https://www.duo.uio.no/handle/10852/34009` |
| `handlykken-2023` | `https://oda.oslomet.no/oda-xmlui/handle/11250/3101983` |
| `paschen-eriksen-2014` | `https://uia.brage.unit.no/uia-xmlui/handle/11250/276369` |
| `syroegina-2016` | `https://aaltodoc.aalto.fi/handle/123456789/21500` |
| `hagan-2025` | `https://trace.tennessee.edu/cgi/viewcontent.cgi?article=14738&context=utk_gradthes` |
| `lund-beijer-2026` | `https://www.sciencedirect.com/science/article/pii/S305083552600001X` |
| `meltzer-hm-2025-what-is-a-sustainable-diet` | `https://doi.org/10.1177/14034948241269763` |
| `parra-lopez-c-2026-enabling-the-circular-food-economy` | `https://onlinelibrary.wiley.com/doi/pdfdirect/10.1111/1541-4337.70431` |
| `stoknes-k-2016-efficiency-of-a-novel-food` | `https://doi.org/10.1016/j.wasman.2016.06.027` |
| `aschemann-witzel-j-2017-consumer-behaviour-towards-price-reduced` | `https://doi.org/10.1016/j.appet.2017.05.013` |
| `gebreeyessus-gd-2022-towards-the-sustainable-and-circular` | `https://doi.org/10.1016/j.scitotenv.2022.155113` |
| `falch-e-2026-maximizing-the-utilization-of-seafood` | `https://doi.org/10.1016/bs.afnr.2025.08.001` |
| `src-16` | `https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-jordbruksomradet/` |
| `src-18` | `https://coop.no/om-coop/virksomheten/finansiell-informasjon/` |
| `src-22` | `https://openaccess.nhh.no/` |
| `src-24` | `https://www.kkv.fi/en/` |
| `src-25` | `https://www.konkurrensverket.se/publikationer/` |
| `src-27` | `regjeringen.no` |
| `src-30` | `asko.no` |
| `src-31` | `nibio.no` |
| `src-32` | `matvett.no` |
| `src-33` | `ec.europa.eu/eurostat` |
| `src-36` | `konkurransetilsynet.no` |
| `src-37` | `menon.no` |
| `src-38` | `uib.no/econ` |
| `src-39` | `nesafinland.fi` |
| `src-40` | `smabrukarlaget.no` |
| `src-43` | `ssb.no/grensehandel` |
| `src-48` | `dlf.no` |
| `src-49` | `miljodirektoratet.no` |
| `src-63` | `https://data.brreg.no/enhetsregisteret/api` |
| `src-65` | `https://www.regjeringen.no/` |
| `src-74` | `https://eatforum.org/eat-lancet-commission/` |
| `src-80` | `https://data.cdrc.ac.uk/` |
| `src-94` | `https://www.greenpeace.org/` |

## Hvorfor mange krever manuell innhenting

Hoveddelen av de 43 P1-oppføringene som flagges `requires_manual` er NHH/NMBU/UiB/NTNU-theses som har migrert fra Brage (`openaccess.nhh.no`, `brage.unit.no`) til NVA (`nva.sikt.no`). NVA er en React-SPA uten server-rendret HTML, så regex-scraping mot landing-page finner ingen `.pdf`-lenker. Det underliggende API-et (`api.nva.unit.no/publication/{uuid}`) er auth-gated — selv for `OpenFile`-typer returnerer `/download`-endpoint `403 Missing Authentication Token` uten gyldig Sikt/Feide-sesjon. Dette betyr at automatisering krever enten:

1. **Feide-autentisert headless browser** (Playwright + login) — ikke implementert i Fase B
2. **Alternative kilder**: Google Scholar, Cristin-API, OpenAlex for de som er indeksert der
3. **Manuell nedlasting via browser** — brukeren åpner `hdl.handle.net/11250/...`, venter på NVA-redirect, klikker "Last ned" mens pålogget

I tillegg står de utenlandske CBS-tesene (`research.cbs.dk/studentProjects/...`) bak Cloudflare-bot-check som avviser alle våre requests med HTTP 403. Disse kan trolig bare hentes fra en ekte browser.

## Neste steg

1. **Manuell innhenting** av høy-prioritet manuelt-flagged oppføringer (spesielt NVA-hostede NHH-theses via browser).
2. **Retry av feilede HTTP 403/429**: disse kan muligens løses med browser-UA eller lengre throttling — evt. ny Fase B2-runde.
3. **Re-kjør audit-kjeden** etter manuell innhenting: `build-seed-pdf-map → audit-platform-linkage → build-pdf-catalog → build-orphan-review → build-download-queue`.
4. **Vurder å kjøre P2/P3** når P1 er ryddet — `node --experimental-strip-types scripts/fetch-download-queue.ts --priority P2`.
