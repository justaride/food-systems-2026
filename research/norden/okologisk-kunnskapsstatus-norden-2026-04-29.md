# Økologisk I Norden: Kunnskapsstatus Og Hentebehov

**Dato:** 2026-04-29
**Status:** Kunnskapsaudit, kildeinnhenting og eksport
**Scope:** Norge, Sverige, Danmark, Finland og Island
**Relaterte lokale filer:** `research/data/nordic/core-series/organic_agriculture_annual.csv`, `research/norden/verdikjede/01-primaerproduksjon.md`, `research/norden/verdikjede/08-forbruk.md`
**Ny evidenspakke:** `research/evidence-pack/okologisk-norden-2026-04-29/`

## Kort Konklusjon

Vi har nå kontroll på et minimumslag for økologisk jordbruksareal i Norden, med Eurostat som sammenliknbar primærkilde for Norge, Sverige, Danmark og Finland. Etter innhentingsrunden 2026-04-29 er dette styrket med nasjonale kontroll-, myndighets- og sektorrapporter i evidenspakken. Island er fortsatt ikke kontrollert på areal/marked på samme nivå og må stå som `needs_primary_check`, men gapet er nå mer eksplisitt dokumentert etter Hagstofa/PxWeb-, Statice- og Lífrænt Ísland-sjekk.

Kunnskapen er nå betydelig dypere på areal, sertifisering/kontroll, markedsindikatorer og offentlig innkjøp for Danmark, Sverige, Finland og Norge. Vi har også sett på flere øko-organisasjoner og rapportflater: Organic Denmark, Økologisk Landsforening, Organic Sweden/Ekologiska Lantbrukarna/KRAV/Ekomatcentrum, Pro Luomu, Debio, Ruokavirasto, ESA/MAST/Tún, TRACES, Hagstofa/Statistics Iceland, VOR/Lífrænt Ísland og islandsk policyplan. Full norsk Landbruksdirektoratet-PDF for 2025 er hentet og integrert. KRAV Effektrapport 2025 og alle sju Ekobarometer-rapportene fra 2023-2025 er nå hentet, tekstuttrukket og lett analysert. Det som fortsatt mangler er særlig islandsk areal-/markedsprimærdata, Økologisk Norge, NORSØK og Luomuinstituutti, pluss dyp tematisk koding av KRAV-rapportene.

Beslutning: bruk evidenspakken som internt analysegrunnlag nå, men bare importer rader til canonical data med eksplisitte quality flags. Prioriter videre innhenting mot åpne gap, ikke generell ny leting.

## Eksporter Etter Innhenting

| Eksport | Innhold |
|---|---|
| `research/evidence-pack/okologisk-norden-2026-04-29/exports/document_manifest.csv` | 50 nedlastede/genererte kilder med eier, status, lokal sti og kvalitetsflagg. |
| `research/evidence-pack/okologisk-norden-2026-04-29/exports/download_inventory.csv` | Filstørrelse og SHA-256 for nedlastede originaler og genererte uttrekk. |
| `research/evidence-pack/okologisk-norden-2026-04-29/exports/organic_key_indicators_extracted.csv` | 100 ekstraherte nøkkelindikatorer for areal, marked, produksjon, kontroll, policy, offentlig innkjøp, KRAV-spesifikke indikatorer og dokumenterte gap. |
| `research/evidence-pack/okologisk-norden-2026-04-29/exports/organic_actor_source_map.csv` | Aktørkart for øko-organisasjoner og myndighetskilder. |
| `research/evidence-pack/okologisk-norden-2026-04-29/exports/organic_document_quality_audit.csv` | Åpne kilde- og kvalitetsavvik. |
| `research/evidence-pack/okologisk-norden-2026-04-29/exports/okologisk-norden-importanalyse-2026-04-29.md` | Kort beslutningsnotat for import og videre arbeid. |

## Integrasjon Etterpå

Innhentede indikatorer er nå flyttet videre til staging og splittede core-series-filer:

| Fil | Rader | Status |
|---|---:|---|
| `research/data/nordic/core-series/_staging/organic_integration_candidates_2026-04-29.csv` | 86 | Full staging med target, importstatus og sammenliknbarhetsflagg. |
| `research/data/nordic/core-series/organic_market_retail_annual.csv` | 14 | Integrert med kilde- og kvalitetsflagg. |
| `research/data/nordic/core-series/organic_control_operators_annual.csv` | 22 | Integrert med kontroll-/operatørdata, TRACES-status, kontrollsystem-referanser og KRAV private-label-rader. |
| `research/data/nordic/core-series/organic_public_procurement_annual.csv` | 8 | Integrert, men ikke direkte sammenliknbar på tvers av land ennå. Svenske rader er splittet på kommunal andel, offentlig sektor-verdiandel og KRAV-andel. |
| `research/data/nordic/core-series/organic_policy_targets.csv` | 3 | Foreløpig policy-/virkemiddelserie med norsk 2032-arealmål og islandsk 2040-arealmål. |
| `research/data/nordic/core-series/organic_selected_production_annual.csv` | 13 | Produktspesifikke produksjonsindikatorer, ikke totalserie. |
| `research/data/nordic/core-series/organic_selected_trade_annual.csv` | 1 | Foreløpig handelspunkt. |

Valideringslogg: `research/data/nordic/core-series/_staging/organic_integration_validation_2026-04-29.json`.

## Hva Vi Har Kontroll På Nå

| Kunnskapslag | Status | Vurdering |
|---|---|---|
| Økologisk jordbruksareal | Sterkt for NO, SE, DK, FI; svakt for IS | Ny kontrollfil finnes i `organic_agriculture_annual.csv`. Eurostat dekker fire land. Hagstofa/PxWeb er sjekket for Island uten å finne øko-serie. |
| Andel økologisk av jordbruksareal | Sterkt for NO, SE, DK, FI; svakt for IS | 2023 er beste nær-komplette sammenlikningsår. 2024 finnes foreløpig for SE og FI i Eurostat-uttrekket. |
| Markedsandel i dagligvare | Middels til sterk | Første staged core-series finnes i `organic_market_retail_annual.csv`; Norge 2025 og sektor-estimater må beholde kvalitetsflagg. |
| Offentlig innkjøp/storkjøkken | Middels, men bedre kontrollert | `organic_public_procurement_annual.csv` har nå svensk Ekomatcentrum/KRAV-grunnlag og finsk kjøkken/skolemelk-grunnlag. Definisjoner må fortsatt skilles mellom kommunal andel, offentlig sektor-verdiandel, KRAV-andel, kjøkkenandel, volum og måltids-/institusjonsandeler. |
| Kontroll/sertifisering | Middels til sterk | Første normaliserte uttrekk finnes i `organic_control_operators_annual.csv`; Island har nå både ESA 2023 og TRACES 2026, men definisjonene må holdes atskilt. |
| Policy/mål | Tidlig | Foreløpig fil finnes i `organic_policy_targets.csv`, inkludert Norge 2032 og Island 2040. |
| Øko-organisasjoner og rapporter | Middels til sterk for DK/SE/FI; svakere for NO/IS dybdelag | Aktørkart finnes i evidenspakken. KRAV enkelt­rapporter er hentet og lett analysert; Økologisk Norge, NORSØK og Luomuinstituutti mangler fortsatt. |

## Dybde Per Land

| Land | Nåværende dybde | Hva vi faktisk har | Viktigste hull |
|---|---|---|---|
| Norge | Sterk | Eurostat-areal, Debio 2024, Landbruksdirektoratet 2025 PDF og staged markeds-/produksjonsrader. | Økologisk Norge/NORSØK og nasjonal offentlig innkjøpsmåling mangler fortsatt. |
| Sverige | Sterk | Eurostat-areal, Jordbruksverket 2024, Ekologiska Årsrapporten 2024, KRAV enkelt­rapporter og Ekomatcentrum/Ekomatsligan-spor. | KRAV-rapportene trenger tematisk koding før effekt-/forbrukerpåstander brukes eksternt. Ekomatcentrum-rader må fortsatt brukes med tydelig scope: kommunal andel, offentlig sektor-verdiandel, KRAV-andel eller måltids-/volumkontekst. |
| Danmark | Sterk | Landbrugsstyrelsen/SGAV 2024, Organic Denmark 2025 og Økologisk Landsforening årsrapport er hentet og mappet. | Små SGAV-tallavvik må avklares; Organic Cuisine Label/offentlig kjøkken må hentes separat. |
| Finland | Middels til sterk | Pro Luomu 2024 og Ruokavirasto 2024 er hentet, analysert og staged. | Markedstall er sektor-estimater; Luomuinstituutti og Luomuliitto er ikke systematisk dekket. |
| Island | Middels på kontroll og aktørkart, lav på areal/marked | ESA bekrefter MAST/Tún-rollene og 55 sertifiserte operatører i 2023. Tún peker direkte til TRACES som register, og TRACES-uttrekket 2026-04-29 har 59 utstedte sertifikater/59 unike operatørnavn. Hagstofa/PxWeb-søk dekket 26 landbrukstabeller uten øko-dimensjon. Lífrænt Ísland-kartet er eksportert med 23 aktøroppføringer. EEA gir historisk arealandel 2012-2020 og policyplanen har 10 % arealmål for 2040. | Primærkilde for nåværende økologisk areal og markedsdata mangler fortsatt. |

## Øko-Organisasjoner Vi Bør Dekke

| Land | Organisasjoner/kilder | Status i repo | Hva de kan gi |
|---|---|---|---|
| NO | Debio, Økologisk Norge, NORSØK, Matvalget, Landbruksdirektoratet | Delvis identifisert | Kontrollstatistikk, marked, politikk, fagrapporter, offentlig kjøkkenkompetanse. |
| DK | Organic Denmark / Økologisk Landsforening, Landbrugsstyrelsen, Innovationscenter for Økologisk Landbrug, ICROFS, Fødevarestyrelsen | Delvis identifisert | Markedsrapport, årsrapport, areal/bedriftsstatistikk, Organic Cuisine Label, eksport/import. |
| SE | KRAV, Organic Sweden, Ekologiska Lantbrukarna, Ekomatcentrum, Jordbruksverket, SLU Epok | Godt identifisert og delvis analysert | Marked, produksjon, sertifisering, offentlig mat, beredskap, ekobarometer. KRAV og Ekomatcentrum er nå lokale kilder, men ikke ferdig tematisk kodet. |
| FI | Pro Luomu, Luomuliitto, Luomuinstituutti, Ruokavirasto, Luke | Svakt til delvis | Marked, kontroll, produksjon, forbrukerbarometer, forskning. |
| IS | MAST, Vottunarstofan Tún, TRACES NT, Hagstofa Íslands, EEA, ESA/EFTA Surveillance Authority, VOR / Lífrænt Ísland | Middels for kontroll/aktørkart, svakt for areal/marked | Sertifiserte operatører, kontrollsystem, import/merking, Hagstofa gap-sjekk, Lífrænt Ísland-produsentkart, historisk arealandel og policy-/datainnsamlingsmål. |

## Eksterne Kilder Funnet I Denne Runden

| Land | Kilde | Hvorfor den er viktig | Handling |
|---|---|---|---|
| NO | [Landbruksdirektoratet: Produksjon og omsetning av økologiske jordbruksvarer 2025](https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Produksjon%20av%20%C3%B8kologiske%20jordbruksvarer%202025%20Rapport%202026%204.pdf/_/attachment/inline/68421871-086b-4f4e-85a7-e1bee2e3eb53%3Adb302444070bb2880c20dc1626f938101fc634cc/Produksjon%20av%20%C3%B8kologiske%20jordbruksvarer%202025%20Rapport%202026%204%20V.pdf) | Ny norsk primærrapport for produksjon og omsetning. | P1: last ned/registrer og trekk ut marked, produksjon, areal, import/omsetning. |
| NO | [Debios statistikk 2024](https://debio.no/content/uploads/2025/03/HEFTE-Debios-statistikk-2024.pdf) | Sertifisering/kontroll og virksomheter i hele verdikjeden. | P1: normaliser til kontroll-/operatorserie. |
| NO | [NORSØK publikasjoner/kunnskapsbase](https://www.norsok.no/) | Faglig dybde på økologisk landbruk, klima, jord, sirkularitet. | P2: hent fagrapporter tematisk, ikke som kvantitativ primærserie. |
| DK | [Landbrugsstyrelsen: Statistik over økologiske jordbrugsbedrifter](https://lbst.dk/bedrift/oekologi/baggrund-og-fakta-om-oekologi-/oekologistatistik) | Offisiell dansk areal-, bedrifts- og produksjonsstatistikk. | P1: bruk som DK-kontroll mot Eurostat og for mer detaljert DK-data. |
| DK | [Organic Denmark: Organic Market Report](https://organicdenmark.com/market-insights/toolbox/organic-market-report/) | Marked, retailandel, eksport/import og forbrukertrender. | P1: trekk ut 2024/2025 retailandel, verdi, volum og eksport. |
| DK | [Økologisk Landsforening årsrapport 2025](https://okologi.dk/media/xloglr53/oekologisk-landsforening-aarsrapport-2025.pdf) | Organisasjonens aktivitet, politikk og sektorprioriteringer. | P2: bruk som aktør-/posisjonskilde, ikke alene som markedsfasit. |
| SE | [Jordbruksverket: Ekologisk växtodling 2024](https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2025-05-15-ekologisk-vaxtodling-2024) | Offisiell svensk areal- og planteproduksjonsstatistikk. | P1: oppdater SE 2024 med myndighetskilde og definisjoner. |
| SE | [Jordbruksverket: Ekologisk animalieproduktion 2024](https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2025-06-27-ekologisk-animalieproduktion-2024) | Offisiell svensk animalsk økoproduksjon. | P1: bygg produktserie for melk, egg, kjøtt. |
| SE | [Ekologiska Årsrapporten 2024](https://www.ekolantbruk.se/rapporter/arsrapport-2024pdf) | Svensk markedsrapport laget av Organic Sweden, Ekologiska Lantbrukarna, KRAV og Ekomatcentrum. | P1: trekk ut totalmarked, andel, kanal og trend. |
| SE | [KRAV rapporter](https://www.krav.se/om-oss/rapporter/) | Ekobarometer og effektrapport for sertifiserings-/merkesystem. | Hentet: Effektrapport 2025 og sju Ekobarometer-rapporter. Neste: tematisk koding. |
| SE | [Ekomatcentrum: Ekomatsligan 2024](https://ekomatcentrum.se/ekomatsligan-rapport2024/) og [EMC marknadsrapport 2023](https://ekomatcentrum.se/wp-content/uploads/2023/05/EMC-marknadsrapport-2023-fardigstalld-1-2.pdf) | Offentlig sektor, storkjøkken, kommuner/regioner og Ekomatsligan. | Hentet og delvis integrert: 2023 offentlig sektor 34,2 %, 2022 offentlig sektor 37 %, 2022 kommunal KRAV/økologisk andel. Neste: hold scope synlig. |
| FI | [Pro Luomu: Organics in Finland](https://proluomu.fi/en/organics-in-finland/) | Årlig finsk sammendrag for produksjon og forbruk. | P1: bruk for marked og offentlig kjøkken. |
| FI | [Pro Luomu: 2024 market update](https://proluomu.fi/en/the-organic-market-is-searching-for-direction/) | Finsk dagligvareverdi og markedsandel 2024. | P1: trekk ut EUR 335 mill. og 1,8 %. |
| FI | [Pro Luomu: 2025 market update](https://proluomu.fi/en/sales-of-organic-food-in-finland-returned-to-growth-in-2025/) | Ny 2025-retning, 342 mill. euro og stabil 1,8 % andel. | P2: legg til når vi bygger 2025-serie. |
| FI | [Ruokavirasto: Luomuvalvonta Suomessa 2024](https://www.ruokavirasto.fi/teemat/luomu/luomu-uutisia_kansio/luomuvalvonta-suomessa-2024/) | Kontrollrapport, antall aktører, inspeksjoner og avvik. | P1: bygg kontroll-/operatorserie. |
| IS | [ESA country profile: Iceland organic control system](https://www.eftasurv.int/cms/sites/default/files/documents/gopro/Country%20Profile%20Part%201%20-%20Iceland.pdf) | Bekrefter MAST som kompetent myndighet og Tún som delegert kontrollorgan. | P1: bruk til kontrollsystem og kildevei, ikke arealfasit. |
| IS | [ESA annual report on official controls 2023](https://www.eftasurv.int/cms/sites/default/files/documents/gopro/Annual%20report%20on%20the%20overall%20operation%20of%20official%20controls%20in%20the%20food%20and%20veterinary%20area%20-%202023_0.pdf) | Angir 55 sertifiserte operatører i Island i 2023 og kontrollvurdering. | P1: legg inn som kontrollpunkt for Island. |
| IS | [MAST årsrapport 2024](https://www.mast.is/is/um-mast/utgefid-efni/skyrslur/arsskyrsla-mast-2024) | Generell matmyndighetsrapport og mulig vei til økologikontroll. | P2: sjekk om øko er omtalt og lenker videre. |
| IS | [Tún: Lífrænt vottaðir aðilar](https://www.tun.is/vottunarskra) og [TRACES organic operator certificates](https://webgate.ec.europa.eu/tracesnt/directory/publication/organic-operator/index) | Direkte registervei for islandske øko-sertifikater; TRACES API gir 59 utstedte sertifikater og 75 offentlige statusrader per 2026-04-29. | P1: bruk som kontroll-/operatørregister med `current_certificate_status_not_annual_control_report`. |
| IS | [Statistics Iceland agriculture](https://www.statice.is/statistics/business-sectors/agriculture/) og [Hagstofa PxWeb agriculture API](https://px.hagstofa.is/pxen/api/v1/en/Atvinnuvegir/landbunadur) | Primærsøk for islandsk nåværende areal/produksjon. Katalogen ble eksportert med 26 landbrukstabeller og ingen øko-/sertifiseringsdimensjon ble funnet. | P1: dokumenter som bekreftet gap; bruk ikke generelle landbrukstall som øko-erstatning. |
| IS | [Lífrænt Ísland](https://lifraentisland.is/) | Sektorplattform og produsentkart. Innebygd kart er eksportert med 23 aktøroppføringer. | P2: bruk til aktør-/casekart; be om eller finn årsmelding/markedsdata separat. |
| IS | [EEA: Area under organic farming - Iceland](https://www.eea.europa.eu/en/europe-environment-2025/countries/iceland/area-under-organic-farming) | Historisk islandsk arealandel 2012-2020 og vurdering av manglende vekst; ikke nåværende arealregister. | P1: hold som historisk share-only støtte, ikke canonical arealfasit. |
| IS | [Efling lífrænnar matvælaframleiðslu](https://www.stjornarradid.is/library/01--Frettatengt---myndir-og-skrar/MAR/Fylgiskjol/MAR_EflingLifraennarMatvaelaframleidslu_Lokautgafa.pdf) | Islandsk handlingsplan fra august 2024 med 10 % økologisk arealmål innen 2040 og tiltak for årlig datainnsamling. | P1: importert som policy target og datagap-kilde. |
| Nordic/global | [FiBL/IFOAM: The World of Organic Agriculture 2026](https://www.fibl.org/en/shop-en/1861-organic-world-2026) | Global/nordisk benchmark for areal, marked, retailandel og sammenlikning. | P1: bruk som global kontroll og for Island dersom primærdata er tynn. |

## Foreslått Datamodell

Vi bør ikke presse alle økologisk-data inn i én serie. Min anbefaling er fem små tabeller:

| Fil | Formål | Status |
|---|---|---|
| `research/data/nordic/core-series/organic_agriculture_annual.csv` | Areal og andel av jordbruksareal | Finnes nå. |
| `research/data/nordic/core-series/organic_market_retail_annual.csv` | Retail/verdiandel/volumandel per land | Opprettet som staged core-series med importstatus. |
| `research/data/nordic/core-series/organic_public_procurement_annual.csv` | Offentlig innkjøp og storkjøkken | Opprettet, men med tydelige sammenliknbarhetsflagg. |
| `research/data/nordic/core-series/organic_control_operators_annual.csv` | Sertifiserte operatører, gårder, foredlere, kontrollbesøk og avvik | Opprettet med første Debio/Landbrugsstyrelsen/Ruokavirasto/ESA-uttrekk. |
| `research/data/nordic/core-series/organic_policy_targets.csv` | Mål og virkemidler | Opprettet som foreløpig policy-/virkemiddelserie. |

## Henterekkefølge

1. **P1 - Kontroll og marked:** Landbruksdirektoratet, Debio, Landbrugsstyrelsen, Organic Denmark, Jordbruksverket, Ekologiska Årsrapporten, Pro Luomu, Ruokavirasto, ESA/MAST/Tún.
2. **P1 - Island primærsjekk:** operatørregister og kontrollorgan er nå bedre dekket via Tún/TRACES/ESA, og Hagstofa/PxWeb/Lífrænt Ísland-sjekken bekrefter at vi fortsatt mangler eksplisitt nåværende areal og markedsdata før Island kan løftes ut av `needs_primary_check`.
3. **P1 - Definisjonsrydding offentlig innkjøp:** Sverige har nå separate rader for Ekomatcentrum 2023 offentlig sektor-verdiandel, EMC 2022 offentlig sektor-verdiandel og KRAV/Matilda kommunal andel. De må ikke blandes med 39 % måltids-/volumrelaterte påstander.
4. **P2 - Organisasjonsrapporter:** Økologisk Norge, KRAV tematisk koding, Ekomatcentrum videre årgang, Luomuliitto, Luomuinstituutti, NORSØK.
5. **P2 - Tidsserier 2015-2025:** retailverdi, markedsandel, operatører, areal, offentlig innkjøp, import/eksport der tilgjengelig.
6. **P3 - Casebank:** København offentlige kjøkken, svenske kommuner/regioner, finske skolemelk-/storkjøkkenordninger, norsk Matvalget/DebioInfo.

## Kvalitetsregler For Videre Bruk

- Skill alltid mellom **økologisk arealandel**, **økologisk markedsandel**, **økologisk offentlig innkjøpsandel** og **sertifiserte operatører**.
- Skill mellom **offisiell myndighetsstatistikk**, **sertifiserings-/kontrollstatistikk**, **bransje-/organisasjonsrapport** og **sekundær analyse**.
- Ikke marker islandsk areal/marked som kontrollert før vi har primærkilde eller FiBL/IFOAM-verifisert tall med klar definisjon. TRACES dekker sertifikater, ikke areal/marked.
- Ikke bruk øko-organisasjonenes markeds- og policyrapport som nøytral fasit uten kryssjekk, men de er nødvendige for sektordybde.
- Hold år, definisjon og måleenhet synlig i alle tabeller. Særlig offentlig innkjøp må merkes med verdi, volum, måltid eller kjøkkenandel.

## Operativ Anbefaling

Neste arbeidsøkt bør være en kontrollert komplettering og runtime-vurdering:

- Bruk svenske offentlig-innkjøpsrader med eksplisitt scope: `public_sector_organic_purchase_share`, `municipal_organic_purchase_share`, `municipal_krav_purchase_share` og eventuelle måltids-/institusjonsandeler må ikke summeres.
- Finn islandsk nåværende areal- og markedsserie før Island brukes som kontrollert areal-/markedsland. Tún/TRACES-operatørsporet og Hagstofa/Lífrænt Ísland-sjekken er nå hentet, men løser ikke areal/marked.
- Temakod KRAV enkelt­rapportene, og last ned Økologisk Norge, NORSØK og Luomuinstituutti for dybdelaget.
- Vurder runtime-kobling først etter at visningslogikken kan håndtere `import_status`, `quality_flag` og `comparability`.
- Revider `research/norden/verdikjede/08-forbruk.md` mot de nye core-series-filene når de åpne kildegatene er lukket eller tydelig merket.
