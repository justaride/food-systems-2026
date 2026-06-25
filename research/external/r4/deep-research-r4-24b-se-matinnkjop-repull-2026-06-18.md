# SE offentlig matinnkjøp 2023-volum — re-pull primærkilde

**ID:** DRO-R4-24b · 2026-06-18 · Felt: SE offentlig matinnkjøp 2023-volum re-pull · Oppgraderer D4-24

---

## Kort dom

**Finnes ferskt primærvolum (2022–2024) for svensk offentlig matinnkjøp: NEI.**

Ingen svensk myndighet (Upphandlingsmyndigheten, Konkurrensverket, SCB) publiserer per 2026-06-18 et direkte målt, segmentspesifikt volum-tall for offentlig livsmedels-/måltidsinnkjøp etter 2019. Det nyeste myndighetstallet som eksisterer i offentlig primærkilde er betalingsdata (utbetalinger fra stat/kommuner/regioner til SNI-klassifiserte livsmedelleverandører) for regnskapsåret **2019: ~10 mrd SEK livsmedel + ~2,0 mrd SEK måltidstjenester**. Kilde: Upphandlingsmyndigheten via Dagens Samhälle Insikt-data, sitert i bransjeside og i rapporten «Matnyttigt och samhällsnyttigt» (2021). Det samme 2019-tallet siteres uendret på Upphandlingsmyndighetens nettside per juni 2026. Det finnes IKKE et tilsvarende offentlig publisert primærtall for 2022, 2023 eller 2024. Verdien D4-24 benyttet (~10 mrd SEK som «2023-tall») er dermed et backregnet estimat — bekreftet av dette re-pull-et.

---

## Datatabell

| Metrikk | Verdi | Enhet | År | Geografi | Metode | Kildeeier | URL | Locator | Datakvalitet |
|---|---|---|---|---|---|---|---|---|---|
| Offentlig matinnkjøp — livsmedel (stat/kommuner/regioner) | ~10 | mrd SEK | 2019 | Sverige (ex. offentlig eide selskaper) | Direkte målt: utbetalinger fra kommuner, regioner og statlige myndigheter til SNI-klassifiserte livsmedelleverandører via Dagens Samhälle Insikt-data | Upphandlingsmyndigheten (bearbeidelse) | https://www.upphandlingsmyndigheten.se/branscher/upphandling-av-livsmedel-och-maltidstjanster/ | Avsnitt «Hållbara inköp av livsmedel och måltidstjänster», §1 | B — direkte målt for 2019, men dekker ~60–65 % av totalen (jf. Mashie/DKAB-paneldekning) og ekskluderer offentlig eide selskaper |
| Offentlig matinnkjøp — måltidstjenester (stat/kommuner/regioner) | ~2,0 | mrd SEK | 2019 | Sverige (ex. offentlig eide selskaper) | Direkte målt: utbetalinger — SNI måltidstjenester | Upphandlingsmyndigheten (bearbeidelse) | https://www.upphandlingsmyndigheten.se/globalassets/dokument/publikationer/rapport-matnyttigt-och-samhallsnyttigt.pdf | Rapport 2021:1, s. 7, fotnote 1 | B — samme begrensning |
| Offentlig matinnkjøp — livsmedel (referert 2016) | ~10 | mrd SEK | 2016 | Sverige (ex. bolag) | Direkte målt: utbetalinger via SNI | Upphandlingsmyndigheten, sitert av Konkurrensverket | https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2018-1_kap29-offentlig-upphandling-av-livsmedel.pdf | Kap. 29, s. 284, fotnote 427 | B — bekrefter at ~10 mrd har vært stabilt anslag fra 2016 til 2019 |
| Totale upphandlingspliktiga inköp — alle sektorer | 1 009 | mrd SEK | 2023 | Sverige | SCB-nasjonalregnskap + UHM-beregning; IKKE livsmedel-spesifikt | Upphandlingsmyndigheten | https://www.upphandlingsmyndigheten.se/statistik/annan-statistik/upphandlingspliktiga-inkop-for-1009-miljarder-kronor/ | Tabell «Upphandlingspliktiga inköp, värde (mdkr)…», rad 2023 | A — direkte målt totalvolum, men uten livsmedel-nedbrytning |
| Annonserte opphandlinger — alle sektorer (estimert verdi) | 931 | mrd SEK | 2024 | Sverige | Anbudsannonser med oppgitt estimert verdi (obligatorisk fra 1. jan 2024) | Upphandlingsmyndigheten | https://www.upphandlingsmyndigheten.se/statistik/upphandlingsstatistik/statistik-om-annonserade-upphandlingar-2024/annonserade-upphandlingar-for-931-miljarder-kronor-2024/ | Overskrift + tabell | A — totalvolum, IKKE livsmedel-spesifikt |
| CPV 15 (livsmedel) — antall annonserte opphandlinger | IKKE rapportert for 2022–2024 | — | 2022–2024 | Sverige | Statistikdatabasen inneholder antall, ikke verdi per CPV for 2022–2024 | Upphandlingsmyndigheten | https://www.upphandlingsmyndigheten.se/statistik/upphandlingsstatistik/statistik-om-annonserade-upphandlingar-2023/tjanster-vanligast-att-upphandla/ | Tabell «De tio vanligaste CPV-huvudgrupperna» — CPV 15 vises ikke i topp 10 | N/A — ingen verdi publisert |

---

## Direkte målt vs backregnet

### Direkte målt (primærvolum)

Det eneste publiserte primærtallet med eksplisitt metodebeskrivelse er **Upphandlingsmyndighetens bearbeidelse av Dagens Samhälle Insikt-utbetalingsdata** for 2016–2019. Metoden er utbetalinger fra offentlige organer (stat, kommuner, regioner) til leverandører klassifisert etter SNI (Standard for svensk næringsgrenseinndeling). Rapporten «Matnyttigt och samhällsnyttigt» (2021:1) beskriver dette eksplisitt i fotnote 1, s. 7:

> *«Siffror baserat på utbetalningar från kommuner, regioner och statliga myndigheter till leverantörer av livsmedel och måltidstjänster enligt standard för svensk näringsgrensindelning (SNI). Statistik från Dagens Samhälle Insikt med Upphandlingsmyndighetens bearbetning. Uppgifter saknas för offentligt ägda bolag och övriga offentliga organisationer.»*

Tallene dekker dermed **IKKE** offentlig eide selskaper (kommunale energiselskaper, helseforetak organisert som AS m.m.). Mashie/DKAB-inndatapanelet som brukes for klima- og hållbarhetsanalyser i samme rapport dekker estimert 60–65 % av offentlige livsmedelsinnkjøp i Sverige.

### Backregnet/estimert

D4-24 presenterte ~10 mrd SEK som et «2023-tall» basert på en fremskrivning av 2019-data med 2023-andelen av totale offentlige innkjøp. Det er **ikke et primærtall** — det er et modellert estimat uten offentlig kildebelegg for det spesifikke årstallet. Dette bekreftes av at:

1. Upphandlingsmyndighetens nettside (hentet 2026-06-18) siterer fortsatt kun 2019-data under livsmedel-segmentet.
2. Rapporten «Matnyttigt och samhällsnyttigt» (mars 2021) — eneste samlede primærpublikasjon — dekker kun 2016–2019.
3. CPV-statistikken for 2022–2024 rapporterer antall opphandlinger per CPV-gruppe, men **ikke verdi** (verdier mangler eller er ikke publisert for CPV 15).
4. Konkurrensverkets livsmedelsgjennomgang 2023–2024 (Rapport 2024:5) behandler dagligvarehandel og konkurranseforhold — ikke offentlig innkjøpsvolum.

### Implikasjon

Det **foreligger ingen offentlig publisert** primærkilde som angir offentlig livsmedelsinnkjøpsvolum for 2022, 2023 eller 2024 i Sverige. Verdien ~10 mrd SEK er et legitimt referansenivå for perioden rundt 2016–2019, men kan ikke fremstilles som et 2023-primærtall. En inflasjonsjustert fremskriving (KPI-justert) fra 2019 til 2023 ville gi et estimat i størrelsesorden 12–14 mrd SEK, men dette er da et estimat, ikke et primærtall.

---

## Kildeledger

| # | Kilde | Type | URL | Hentet |
|---|---|---|---|---|
| K1 | Upphandlingsmyndigheten: «Upphandling av livsmedel och måltidstjänster» (nettside) | Primær — myndighetsnettside | https://www.upphandlingsmyndigheten.se/branscher/upphandling-av-livsmedel-och-maltidstjanster/ | 2026-06-18 |
| K2 | Upphandlingsmyndigheten: «Matnyttigt och samhällsnyttigt» Rapport 2021:1 | Primær — myndighetsrapport | https://www.upphandlingsmyndigheten.se/globalassets/dokument/publikationer/rapport-matnyttigt-och-samhallsnyttigt.pdf | 2026-06-18 |
| K3 | Upphandlingsmyndigheten: «Upphandlingspliktiga inköp för 1 009 miljarder kronor» (statistikkside, pub. 2025-10-03) | Primær — myndighetsstatistikk | https://www.upphandlingsmyndigheten.se/statistik/annan-statistik/upphandlingspliktiga-inkop-for-1009-miljarder-kronor/ | 2026-06-18 |
| K4 | Upphandlingsmyndigheten: «Annonserade upphandlingar för 931 miljarder kronor 2024» (pub. 2026-02-05) | Primær — myndighetsstatistikk | https://www.upphandlingsmyndigheten.se/statistik/upphandlingsstatistik/statistik-om-annonserade-upphandlingar-2024/annonserade-upphandlingar-for-931-miljarder-kronor-2024/ | 2026-06-18 |
| K5 | Upphandlingsmyndigheten: «Tjänster vanligast att upphandla» (CPV-statistikk 2023, pub. 2024-12-02) | Primær — myndighetsstatistikk | https://www.upphandlingsmyndigheten.se/statistik/upphandlingsstatistik/statistik-om-annonserade-upphandlingar-2023/tjanster-vanligast-att-upphandla/ | 2026-06-18 |
| K6 | Konkurrensverket Rapport 2018:1 kap. 29 «Offentlig upphandling av livsmedel» | Primær — myndighetsrapport | https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2018-1_kap29-offentlig-upphandling-av-livsmedel.pdf | 2026-06-18 |
| K7 | Konkurrensverket Rapport 2024:5 «Genomlysning av livsmedelsbranschen 2023–2024» | Primær — myndighetsrapport | https://www.konkurrensverket.se/informationsmaterial/rapportlista/konkurrensverkets-genomlysning-av-livsmedelsbranschen-20232024/ | 2026-06-18 |
| K8 | Upphandlingsmyndigheten: Statistiktjenesten (oversiktsside) | Primær — myndighetsnettside | https://www.upphandlingsmyndigheten.se/statistik/ | 2026-06-18 |

---

## Tomme celler / ikke funnet

- **Offentlig livsmedelsinnkjøpsvolum 2020, 2021, 2022, 2023 (direkte målt):** Ikke publisert av Upphandlingsmyndigheten, Konkurrensverket eller SCB. Ingen rapport etter «Matnyttigt och samhällsnyttigt» (2021, dekkende 2016–2019) publiserer dette som et primærtall.
- **CPV 15-verdi (livsmedel) fra statistikdatabasen 2022–2024:** Statistikdatabasen publiserer antall opphandlinger per CPV, men i 2022–2023-oversikten er verdi per CPV-gruppe ikke tilgjengelig i publiserte tabeller (kun totalverdier for alle sektorer samlet).
- **SCB-data segmentert på livsmedel:** SCB-nasjonalregnskap brukes som grunnlag for Upphandlingsmyndighetens totalberegning (1 009 mrd SEK for 2023), men SCB publiserer ikke offentlige livsmedelsinnkjøp som en isolert post.
- **Ekomatcentrum marknadsrapport 2022/2023 — absolutt totalverdi:** Ekomatcentrum rapporterer andeler (% ekologisk), ikke absolutte totalverdier for offentlig livsmedelsinnkjøp. Nettside (ekomatcentrum.se) var utilgjengelig ved henting.
- **Konkurrensverket «Mat och marknad — offentlig upphandling» (2011:4):** Gammel rapport (2011), ikke relevant for 2022–2024-tall.

---

*Re-pull utført av: DRO-R4-24b-agent · 2026-06-18 · Wageningen-guardrail: ingen EU/Wageningen-tall benyttet*
