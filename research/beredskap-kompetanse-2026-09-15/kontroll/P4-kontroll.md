# Kontroll av P4 – praktisk kompetanse og arbeidskraft i matkjeden (versjon A og B)

Kontrollert 15. september 2026 mot primærkildene. Nettsider ble hentet med WebFetch. PDF-er ble lastet ned med WebFetch og lest som tekst. Hver dom gjelder påstanden slik den står i leveransen.

## 1. Oppsummering

**Omfang:** Jeg kontrollerte 85 id_unik-rader: 39 fra A og 46 fra B. Tre av B-radene har ingen egen ID i påstandstabellen; det gjelder NAV 2026-tallene og et sitat fra SOU. Tall som er likt i A og B med samme kilde, er sjekket én gang og gitt samme dom for begge id_unik. Rene kvalitative rader er ikke sjekket, med unntak av veterinærfunnene og EURES-klassifiseringene. Det gjelder NO-015 og NO-016 i A, FI-007, FI-008, IS-002 og NO-015 i B.

| Dom | Antall |
|---|---:|
| behold | 78 |
| rett | 4 |
| forkast | 0 |
| ikke_verifisert | 3 |

**Viktigste funn**

1. **Kjernetallene holder.** Tallene fra SSB, Resultatkontrollen 2026, Jordbruksverket, Danmarks Statistik, Luke, Hagstofa, NAV 2025, Arbeidstilsynet og ELA/EURES stemmer med kildene, både i A og B. Ingen påstander måtte forkastes.
2. **Danske slakterier: begge versjonene stemmer.** A bruker Tabel C for 2020: 12 365 FTE, der 67 % er danske. B bruker den løpende teksten: 15 000 → 12 400 FTE og under 3 000 → over 4 000 utenlandske. A sine 33 % står ikke direkte i kilden, men er regnet ut som 100 − 67.
3. **NAV 2026 kan bare delvis bekreftes.** NAVs egen pressemelding sier «34 000 personer» og at 18 % av virksomhetene har hatt rekrutteringsproblemer. Det eksakte tallet 33 750, og yrkestallene 550 sjåfører og ca. 700 kokker, fant jeg ikke. Rapporten (DOI) ga 403, og yrkestabellene ligger bare i Excel. Kompetansegapet.no viste ingen tall.
4. **Småfeil som må rettes:**
   - A oppgir fiske og akvakultur i Danmark som «8 → 16 %». Kilden sier bare 16 % i 2020 og «fordobling» siden 2008. De 8 % i samme setning gjelder meierier.
   - Den finske utenlandsandelen for fast arbeidskraft er litt for høy både i A og B. 2 600 av «litt over 11 000» gir under 23,6 %, altså ca. 23 %, ikke 24 %.
   - B siterer SOU 2022:58 om at Distriktsveterinärernas bemanning er «mycket svår». Det uttrykket finnes ikke i fullteksten.
5. **Egne beregninger er riktige.** 65,7 % (100 − 34,3) og 29,4 % ((2 844 − 2 008)/2 844) stemmer. 57 % (13 200/23 000 = 57,4) stemmer. 24 % bør være ca. 23 %; se punkt 4.
6. **Tillväxtverket-rapporten er ikke konsistent med seg selv.** Kapittel 3 sier 31 % utenlandsfødte i livsmedelsindustrin mot 33 % i hele sektoren. Kapittel 1.4.3 og 2.1.2 sier 31 % for hele livsmedelssektorn. Påstanden i A og B har støtte i industrikapitlet, men tallet bør brukes med forsiktighet.

## 2. A/B-avvik

| Tema | A | B | Hva kilden sier | Hvem stemmer |
|---|---|---|---|---|
| Danske slakterier | 12 365 FTE, 33 % utenlandske (2020) | ca. 15 000 → 12 400 FTE; under 3 000 → over 4 000 utenlandske (2008 → 2020) | Tabel C: 12 365 FTE, 8 320 danske (67 %). Teksten: «fra 15.000 til 12.400» og «fra lige under 3.000 til lidt over 4.000». | Begge. A sine 33 % er utregnet og bør merkes som egen beregning. |
| Fiske og akvakultur, DK | 8 → 16 % (2008 → 2020) | ca. 16 % i 2020, doblet siden 2008 | 16 % i 2020, pluss «fordobling» siden 2008. De 8 % i setningen gjelder meierier i 2020. Tabel C: 84 % danske. | B. A må rettes. |
| EURES, lastebilsjåfører | Mangel i SE, overskudd i FI (NO nevnes ikke) | Mangel i NO og SE, overskudd i FI | Mangelraden omfatter NO og SE. Overskuddsraden er AT, EL, FI og LU. DK og IS står ikke i raden. | B er mer fullstendig. A er ikke feil. |
| NAV 2026 | Ikke omtalt | Samlet mangel 33 750; 550 sjåfører; ca. 700 kokker | Pressemeldingen: «34 000 personer» og 18 % med rekrutteringsproblemer. Yrkestall er ikke funnet. | Ikke verifisert. Skriv «om lag 34 000» og bruk 2025-tallene som hovedtall. |
| Utenlandsk arbeidskraft, SE | Ikke omtalt | 158 300 sysselsatte, over 86 % permanent, 53 300 AWU. Bemanningsforetak fanges ikke opp. | Alt bekreftet. Kilden sier utenlandsk arbeidskraft er «nästan uteslutande» ansatt via bemanningsforetak. | B. |
| Svensk etterfølger | Ikke omtalt | 24 % har etterfølger klar | «Knappt en fjärdedel, 24 %» blant brukere 60–80 år | B. |
| Same ID, ulik påstand | SE-003 = utdanning 24/7 %; SE-004/005 = industri; SE-006 = sjåfører; SE-007 = SOU; SE-008 = veterinær-EURES; DK-009 = slakterier; DK-010 = veterinær-EURES; NO-016 = mobilitet | SE-003 = etterfølger; SE-004/005 = sysselsetting jordbruk; SE-006/007 = industri; SE-008 = sjåfører; SE-009 = SOU; SE-010 = veterinær-EURES; DK-009 = veterinær-EURES; DK-010 = slakterier; NO-016 = sjåfør-EURES | – | Begge er innholdsmessig riktige. Hold id_unik atskilt ved import. |
| Finsk arbeidskategori | «fast arbeidskraft» | «mer varig innleid» | Luke skriver «permanent employees» (litt over 11 000) og «short-term» (23 000). | A er nærmest ordlyden. Begge bør rette 24 → ca. 23 %. |
| SOU 2022:58, sitat | Mangelkonklusjon (s. 18–19, 24) | Samme, pluss «mycket svår» om Distriktsveterinärerna | Konklusjonen står på s. 24. «Mycket svår» finnes ikke i fullteksten. | A. B må fjerne sitatet. |
| Metadata | Slettebak og Rye publisert «2022-04-06»; Luke arbeidskraft 2025-02-28 | Slettebak og Rye «2022»; Luke «2025-03» | Hefteangivelse: Vol. 12, nr. 4, desember 2022. Luke: 28.2.2025. | Små feil i metadata på begge sider, uten betydning for tallene. |

## 3. Kontrolltabell

URL-koder er forklart under tabellen.

| id_unik | Påstand (kort) | Dom | Hva kilden sier / rettelse | URL |
|---|---|---|---|---|
| A:P4-NO-001, B:P4-NO-001 | 36 627 jordbruksbedrifter 2025, −12,8 % fra 2015 | behold | Tabell 1: 36 627 og −12,8 %. Publisert 23.1.2026. | U1 |
| A:P4-NO-002, B:P4-NO-002 | Areal i drift 9 860 355 → 9 866 661 daa | behold | Nøyaktig disse tallene; +0,1 % over tiåret. | U1 |
| A:P4-NO-003, B:P4-NO-003 | Gjennomsnittsalder menn/kvinner 53,3/50,0 (2025) | behold | Tabell 10-4: 53,3 og 50,0, foreløpige tall. Tabellen står på s. 221, ikke s. 220. | U2 |
| B:P4-NO-003 (del 2) | 19 % ≤39 år, 60 % ≥50 år, 34 603 brukere, 45 % i 1999 | behold | Tabell 5-20 og teksten: «I 2025 … 19 prosent», «økte til 60 prosent i 2025», totalt 34 603, og 45 % i 1999. | U2 |
| A:P4-NO-004, B:P4-NO-004 | Timeverk 120 → 75 mill. (2004/05 → 2023) | behold | Tabell 10-9: 120 og 75. Tabellen står på s. 225. | U2 |
| A:P4-NO-005, B:P4-NO-005 | Landbruksutdanning som høyeste utdanning, nye eiere: 8,8/3,9 % (2024) | behold | Tabell 10-11, raden «Totalt»: 8,8 og 3,9. | U2 |
| A:P4-NO-006, B:P4-NO-006 | EU11-fødte maskinoperatører 18,9 → 45,2 % | behold | «rose to 18.9% in 2009 and further to 45.2% in 2018» (s. 29). Norskfødte 60,2 → 34,3 % er også bekreftet. | U3 |
| A:P4-NO-007, B:P4-NO-007 | Utenlandsfødte 65,7 % (egen beregning) | behold | 100 − 34,3 = 65,7. Regnestykket er riktig. Studien omfatter bosatte; korttidsarbeidere og bemanningsansatte er ikke med. Anslaget om 18–24 % sesongøkning i B er bekreftet. | U3 |
| A:P4-NO-008, B:P4-NO-008 | I underkant av 46 000 sysselsatte i næringsmiddelindustrien 2023 | behold | S. 30: «I 2023 var i underkant av 46 000 personer sysselsatt». Tabell 1: 45 900. | U4 |
| A:P4-NO-009, B:P4-NO-009 | NAV 2025: mangel på 300 slaktere/fiskehandlere | behold | Tabell V1: 300 (KI 150–600). | U5 |
| A:P4-NO-010, B:P4-NO-010 | NAV 2025: mangel på 300 operatører i næringsmiddelproduksjon | behold | Tabell V1: 300 (KI 150–550). | U5 |
| A:P4-NO-011, B:P4-NO-011 | NAV 2025: mangel på 400 lastebilsjåfører, KI 300–550 | behold | Tabell V1, «Lastebil- og trailersjåfører»: 400 (300–550). | U5 |
| A:P4-NO-014, B:P4-NO-014 | NAV 2025: mangel på 950 kokker | behold | Tabell V1: 950 (KI 700–1 250). | U5 |
| B:NAV2026-samlet (del A, uten egen ID) | NAV 2026: samlet mangel 33 750, nær én av fem virksomheter med problemer | ikke_verifisert | Pressemeldingen sier «mangler 34 000 personer» og «18 prosent av virksomhetene». 33 750 kunne ikke kontrolleres: DOI 10.60847/NAV.6225 ga 403, og tabellene ligger i Excel. Skriv «om lag 34 000». | U6 |
| B:NAV2026-sjåfører (del A/B, uten egen ID) | NAV 2026: mangel på 550 lastebilsjåfører (sekundærkilde) | ikke_verifisert | Hverken pressemeldingen eller Kompetansegapet viste yrkestall. NAV-rapporten ga 403. | U6, U7 |
| B:P4-NO-017 | NAV 2026: mangel på ca. 700 kokker (sekundærkilde) | ikke_verifisert | Kompetansegapet.no (/yrke/2223 og /card/story) viste ingen tall. NAV-rapporten ga 403. | U7, U6 |
| B:P4-NO-016 | EURES 2025: mangel på lastebilsjåfører i Norge | behold | Raden «Heavy truck and lorry drivers», mangel: NO er med (s. 9). | U8 |
| A:P4-SE-006, B:P4-SE-008 | EURES 2025: mangel på lastebilsjåfører i Sverige | behold | SE står i mangelraden (s. 9). | U8 |
| A:P4-FI-006, B:P4-FI-006 | EURES 2025: overskudd av lastebilsjåfører i Finland | behold | Overskuddsraden: AT, EL, FI, LU (s. 9). | U8 |
| A:P4-SE-008, B:P4-SE-010 | EURES 2025: mangel på veterinærer i Sverige | behold | «Veterinarians», mangel: BE, BG, DK, EL, FR, IT, NL, PT, RO, SE, SI (s. 17). | U8 |
| A:P4-DK-010, B:P4-DK-009 | EURES 2025: mangel på veterinærer i Danmark | behold | DK står i mangelraden (s. 17). | U8 |
| A:P4-NO-012, B:P4-NO-012 | Rekrutteringsproblemer i produksjonsdyrpraksis og vakt, særlig ved store avstander og lite husdyrgrunnlag | behold | Sammendraget: problemene er «størst i områder med store reiseavstander og få husdyrbesetninger». | U9 |
| A:P4-NO-013, B:P4-NO-013 | Ved store utbrudd kan privatpraktiserende ikke uten videre frigjøres; opplæring og smittefare begrenser | behold | S. 48: «bemanningen i klinisk praksis mange steder på et minimum». Kilden nevner også opplæring og smittefare. | U9 |
| A:P4-SE-007, B:P4-SE-009 | SOU 2022:58: mangel på veterinærer og djursjukskötare | behold | S. 24: «det råder brist inte bara på veterinärer utan även på djursjukskötare». | U10 |
| B:SOU-mycket-svår (del B/C, uten egen ID) | Distriktsveterinärernas bemanning beskrevet som «mycket svår» | rett | Uttrykket ble ikke funnet i fulltekstsøk (orddeling ble slått sammen før søket). Fjern sitattegnene eller legg til en lokator som kan kontrolleres. | U10 |
| A:P4-SE-001, B:P4-SE-001 | 54 723 jordbruksforetak 2025, −23 % fra 2010 | behold | «År 2025 fanns det 54 723 jordbruksföretag»; «minskat med 23 %». | U11 |
| A:P4-SE-002, B:P4-SE-002 | Andel innehavere ≥65 år: 27 % (2010) → over 40 % (2025) | behold | «Drygt 40 %» i 2025, «27 %» i 2010. Gjelder enskild firma. | U11 |
| B:P4-SE-003 | 24 % har etterfølger klar (60–80 år, over 10 000 euro) | behold | «Knappt en fjärdedel, 24 %». Utvalgsramme 11 198, utvalg 2 013, ca. 1 300 svar. | U12 |
| B:P4-SE-004 | 158 300 sysselsatte, over 86 % permanent, 53 300 AWU (2023) | behold | Alle tre tallene er bekreftet. 1 AWU = 1 800 timer. | U13 |
| B:P4-SE-005 | Innleid utenlandsk arbeidskraft fanges ikke opp | behold | «Inhyrd personal redovisas inte i statistiken»; utenlandsk arbeidskraft er «nästan uteslutande» ansatt via bemanningsforetak. | U13 |
| A:P4-SE-003 | 24 % naturbruksutdanning på videregående, 7 % høyere landbruks-/skogbruks-/veterinærutdanning (2020) | behold | Kap. 2.1.2: «naturbruk, 24 procent» og «Sju procent». Primærproduksjonen omfatter SNI 01, 02.300 og 03, altså også fiske. | U14 |
| A:P4-SE-004, B:P4-SE-006 | Ca. 53 000 sysselsatte i industriutvalget (2020) | behold | Kap. 3: «samma år var 53 000, varav 48 200 var anställda». Omfatter SNI 10–12. | U14 |
| A:P4-SE-005, B:P4-SE-007 | 31 % utenlandsfødte i industriutvalget | behold | Kap. 3.1: «31 jämfört med 33 procent år 2020» (industri mot hele sektoren). Obs: kap. 1.4.3 oppgir 31 % for hele sektoren, så rapporten er ikke konsistent. | U14 |
| A:P4-DK-001 | Landbruks-/gartneribedrifter 51 676 → 27 024 (2005 → 2025) | behold | Nyt nr. 158, 19.6.2026. Tallene og −48 % er bekreftet. | U15 |
| B:P4-DK-001 | 27 024 bedrifter i 2025, −48 % fra 2005 | behold | Temasiden: «faldt … med 48 pct. – tæt på en halvering». | U16 |
| A:P4-DK-002, B:P4-DK-002 | Selvstendige heltidsbønder 12 300 → 7 500 (2010 → 2020) | behold | Bekreftet. Publisert 6.9.2022. | U17 |
| A:P4-DK-003, B:P4-DK-003 | Gjennomsnittsalder 49,2 → 53,6 | behold | Bekreftet. | U17 |
| A:P4-DK-004, B:P4-DK-004 | 76 % med yrkesutdanning som høyeste fullførte utdanning | behold | «76 pct. … erhvervsfaglig uddannelse som den højest fuldførte». | U17 |
| A:P4-DK-005, B:P4-DK-005 | Utenlandske i svineproduksjon 32 → 51 % av FTE | behold | S. 6: «fra 32 pct. i 2008 til 51 pct. i 2020». | U18 |
| A:P4-DK-006, B:P4-DK-006 | Fiskeforedling 2 844 FTE (2020) | behold | Tabel C (s. 13): 2 844, hvorav 2 008 danske (71 %). | U18 |
| A:P4-DK-007, B:P4-DK-007 | Utenlandske 29,4 % (egen beregning) | behold | 836/2 844 = 29,4 %. Stemmer med at 71 % er danske i Tabel C. | U18 |
| A:P4-DK-008 | Fiske og akvakultur 8 → 16 % (2008 → 2020) | rett | Kilden oppgir 16 % i 2020 og «fordobling» siden 2008. 8 % i 2008 er bare underforstått; de 8 % i setningen gjelder meierier. Skriv: «16 % i 2020, omtrent doblet siden 2008». | U18 |
| B:P4-DK-008 | Fiske og akvakultur ca. 16 %, doblet siden 2008 | behold | «16 pct. i 2020 … fordobling». Tabel C: 84 % danske. | U18 |
| A:P4-DK-009 | Slakterier 12 365 FTE, 33 % utenlandske (2020) | behold | Tabel C (s. 12): 12 365 FTE, hvorav 8 320 danske (67 %). 33 % er utledet (100 − 67) og bør merkes som egen beregning. | U18 |
| B:P4-DK-010 | Slakterier ca. 15 000 → 12 400 FTE; utenlandske under 3 000 → over 4 000 | behold | S. 5: «fra 15.000 til 12.400» og «fra lige under 3.000 til lidt over 4.000». Fødevareområdet 20 → 33 % og 1 924 løntimer per FTE (B del B) er også bekreftet. | U18 |
| A:P4-FI-001, B:P4-FI-001 | 39 825 landbruks-/hagebruksbedrifter 2025 | behold | Bekreftet. 84 % er familiebruk. Publisert 30.4.2026. | U19 |
| A:P4-FI-002, B:P4-FI-002 | 118 000 personer, 55 000 AWU (2023) | behold | Bekreftet. Publisert 28.2.2025, ikke «2025-03» som B skriver. | U20 |
| A:P4-FI-003, B:P4-FI-003 | Bedrifter −22 %, arbeidsinnsats −24 % (2013–2023) | behold | Bekreftet, og produksjonsvolumet har ikke falt merkbart. | U20 |
| A:P4-FI-004, B:P4-FI-004 | Utenlandsandel blant fast ansatte ca. 24 % (egen beregning) | rett | 2 600 av «a little more than 11,000» gir under 23,6 %. Skriv «ca. 23 %» eller «knapt 24 %». Kildens tall (2 600 og litt over 11 000) er riktige. | U20 |
| A:P4-FI-005, B:P4-FI-005 | Utenlandsandel blant kortvarig ansatte ca. 57 % | behold | 13 200/23 000 = 57,4 %. | U20 |
| A:P4-IS-001, B:P4-IS-001 | Gårder 2 795 → 2 421 (2008 → 2020), fem produksjonsgrener | behold | Bekreftet, inkludert de fem grenene. Publisert 2.6.2022. | U21 |

**URL-koder**

- U1: https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/statistikk/gardsbruk-jordbruksareal-og-husdyr
- U2: https://www.nibio.no/tema/landbruksokonomi/grunnlagsmateriale-til-jordbruksforhandlingene/_/attachment/inline/af4e716f-bcc8-4ee5-93f1-a1d6431f2160:d3fb8aa8491cecf701be84aeeeb92e2d21295c0a/UT-3-2026%20Resultatkontrollen%202026_Oppdatert%2012.5.2026.pdf
- U3: https://tidsskrift.dk/njwls/article/download/132265/177558/290618
- U4: https://www.arbeidstilsynet.no/globalassets/rapportar/kompass/kompass-tema-nr-1.-2024-arbeidsulykker-i-industrien.pdf
- U5: https://www.nav.no/_/attachment/download/70f5589e-0dc3-4166-a20d-2de0658d8a7e%3A75794e5b17f2303980941f3834e0cedfae442a9e/04-25-Nav-rapport-Navs%20bedriftsunders%C3%B8kelse%202025.%20Stor%20mangel%20p%C3%A5%20folk%20med%20fagbrev.pdf
- U6: https://www.nav.no/no/nav-og-samfunn/kunnskap/analyser-fra-nav/nyheter/bedriftsundersokelsen-2026-norske-virksomheter-mangler-34-000-personer (også prøvd: https://doi.org/10.60847/NAV.6225 → bibliotek.nav.no ga 403; https://www.nav.no/arbeidsgiver/bedriftsunderskelsen ga 404)
- U7: https://kompetansegapet.no/yrke/2223/card/story og https://kompetansegapet.no/yrke/2223
- U8: https://www.ela.europa.eu/sites/default/files/2026-06/annex-labour-shortages-report-ela-2025.pdf
- U9: https://www.regjeringen.no/contentassets/1807e0e77eb443fbbdf53cf24a7132a9/rapport-om-tilgang-pa-veterinartjenester-i-norge-10.03.23.pdf
- U10: https://www.regeringen.se/contentassets/5a0e209dcee242b6b2a86983c87372c3/sou-2022_58.pdf
- U11: https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2025-11-11-jordbruksforetag-och-foretagare-2025
- U12: https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2026-06-05-generationsvaxling-2026
- U13: https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2024-06-13-sysselsattning-i-jordbruket-2023
- U14: https://tillvaxtverket.se/download/18.4c087c7f19e48e9a765cd56/1779377350373/livsmedelssektorns_kompetensforsorjning_en%20syntesrapport.pdf
- U15: https://www.dst.dk/nyt/54456
- U16: https://www.dst.dk/da/Statistik/emner/erhvervsliv/landbrug-gartneri-og-skovbrug/bedrifter-og-arbejdskraft-i-landbrug-og-gartneri
- U17: https://www.dst.dk/analyser/49360-portraet-af-danske-landmaend
- U18: https://www.dst.dk/analysepdf/48223
- U19: https://www.luke.fi/en/statistics/structure-of-agricultural-and-horticultural-enterprises/structure-of-agricultural-and-horticultural-enterprises-2025
- U20: https://www.luke.fi/en/statistics/agricultural-and-horticultural-labour-force/agricultural-and-horticultural-labour-force-2023
- U21: https://statice.is/publications/news-archive/agriculture/income-statement-and-balance-sheet-for-agriculture-2008-2020/

## 4. CSV

```csv
id_unik,dom,rettelse,url_kontrollert,kommentar
A:P4-NO-001,behold,,https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/statistikk/gardsbruk-jordbruksareal-og-husdyr,"36 627; -12,8 %; publ. 23.1.2026"
B:P4-NO-001,behold,,https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/statistikk/gardsbruk-jordbruksareal-og-husdyr,"36 627; -12,8 %; publ. 23.1.2026"
A:P4-NO-002,behold,,https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/statistikk/gardsbruk-jordbruksareal-og-husdyr,"9 860 355 -> 9 866 661 daa"
B:P4-NO-002,behold,,https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/statistikk/gardsbruk-jordbruksareal-og-husdyr,"9 860 355 -> 9 866 661 daa"
A:P4-NO-003,behold,,https://www.nibio.no/tema/landbruksokonomi/grunnlagsmateriale-til-jordbruksforhandlingene/_/attachment/inline/af4e716f-bcc8-4ee5-93f1-a1d6431f2160:d3fb8aa8491cecf701be84aeeeb92e2d21295c0a/UT-3-2026%20Resultatkontrollen%202026_Oppdatert%2012.5.2026.pdf,"Tabell 10-4: 53,3/50,0 (foreløpig); tabellen står på s. 221, ikke s. 220"
B:P4-NO-003,behold,,https://www.nibio.no/tema/landbruksokonomi/grunnlagsmateriale-til-jordbruksforhandlingene/_/attachment/inline/af4e716f-bcc8-4ee5-93f1-a1d6431f2160:d3fb8aa8491cecf701be84aeeeb92e2d21295c0a/UT-3-2026%20Resultatkontrollen%202026_Oppdatert%2012.5.2026.pdf,"Tabell 10-4 og 5-20: 53,3/50,0; 19 % <=39; 60 % over 50 (45 % i 1999); 34 603 brukere"
A:P4-NO-004,behold,,https://www.nibio.no/tema/landbruksokonomi/grunnlagsmateriale-til-jordbruksforhandlingene/_/attachment/inline/af4e716f-bcc8-4ee5-93f1-a1d6431f2160:d3fb8aa8491cecf701be84aeeeb92e2d21295c0a/UT-3-2026%20Resultatkontrollen%202026_Oppdatert%2012.5.2026.pdf,"Tabell 10-9: 120 (2004/05) og 75 (2023); s. 225"
B:P4-NO-004,behold,,https://www.nibio.no/tema/landbruksokonomi/grunnlagsmateriale-til-jordbruksforhandlingene/_/attachment/inline/af4e716f-bcc8-4ee5-93f1-a1d6431f2160:d3fb8aa8491cecf701be84aeeeb92e2d21295c0a/UT-3-2026%20Resultatkontrollen%202026_Oppdatert%2012.5.2026.pdf,"Tabell 10-9: 120 og 75"
A:P4-NO-005,behold,,https://www.nibio.no/tema/landbruksokonomi/grunnlagsmateriale-til-jordbruksforhandlingene/_/attachment/inline/af4e716f-bcc8-4ee5-93f1-a1d6431f2160:d3fb8aa8491cecf701be84aeeeb92e2d21295c0a/UT-3-2026%20Resultatkontrollen%202026_Oppdatert%2012.5.2026.pdf,"Tabell 10-11 Totalt: 8,8/3,9 (2024)"
B:P4-NO-005,behold,,https://www.nibio.no/tema/landbruksokonomi/grunnlagsmateriale-til-jordbruksforhandlingene/_/attachment/inline/af4e716f-bcc8-4ee5-93f1-a1d6431f2160:d3fb8aa8491cecf701be84aeeeb92e2d21295c0a/UT-3-2026%20Resultatkontrollen%202026_Oppdatert%2012.5.2026.pdf,"Tabell 10-11 Totalt: 8,8/3,9 (2024)"
A:P4-NO-006,behold,,https://tidsskrift.dk/njwls/article/download/132265/177558/290618,"18,9 -> 45,2 % (s. 29); publisert i Vol. 12 nr. 4 desember 2022, ikke 2022-04-06"
B:P4-NO-006,behold,,https://tidsskrift.dk/njwls/article/download/132265/177558/290618,"18,9 -> 45,2 %; norskfødte 60,2 -> 34,3 %; sesonganslag 18-24 % bekreftet"
A:P4-NO-007,behold,,https://tidsskrift.dk/njwls/article/download/132265/177558/290618,"100-34,3=65,7 riktig; bosatte, uten korttids- og bemanningsansatte"
B:P4-NO-007,behold,,https://tidsskrift.dk/njwls/article/download/132265/177558/290618,"100-34,3=65,7 riktig; B-sitatet er forkortet med utelatelser"
A:P4-NO-008,behold,,https://www.arbeidstilsynet.no/globalassets/rapportar/kompass/kompass-tema-nr-1.-2024-arbeidsulykker-i-industrien.pdf,"S. 30: i underkant av 46 000 (tabell 1: 45 900)"
B:P4-NO-008,behold,,https://www.arbeidstilsynet.no/globalassets/rapportar/kompass/kompass-tema-nr-1.-2024-arbeidsulykker-i-industrien.pdf,"S. 30: i underkant av 46 000; «rundt 46 000» i del A er akseptabelt"
A:P4-NO-009,behold,,https://www.nav.no/_/attachment/download/70f5589e-0dc3-4166-a20d-2de0658d8a7e%3A75794e5b17f2303980941f3834e0cedfae442a9e/04-25-Nav-rapport-Navs%20bedriftsunders%C3%B8kelse%202025.%20Stor%20mangel%20p%C3%A5%20folk%20med%20fagbrev.pdf,"Tabell V1: 300 (KI 150-600)"
B:P4-NO-009,behold,,https://www.nav.no/_/attachment/download/70f5589e-0dc3-4166-a20d-2de0658d8a7e%3A75794e5b17f2303980941f3834e0cedfae442a9e/04-25-Nav-rapport-Navs%20bedriftsunders%C3%B8kelse%202025.%20Stor%20mangel%20p%C3%A5%20folk%20med%20fagbrev.pdf,"Tabell V1: 300 (KI 150-600)"
A:P4-NO-010,behold,,https://www.nav.no/_/attachment/download/70f5589e-0dc3-4166-a20d-2de0658d8a7e%3A75794e5b17f2303980941f3834e0cedfae442a9e/04-25-Nav-rapport-Navs%20bedriftsunders%C3%B8kelse%202025.%20Stor%20mangel%20p%C3%A5%20folk%20med%20fagbrev.pdf,"Tabell V1: 300 (KI 150-550)"
B:P4-NO-010,behold,,https://www.nav.no/_/attachment/download/70f5589e-0dc3-4166-a20d-2de0658d8a7e%3A75794e5b17f2303980941f3834e0cedfae442a9e/04-25-Nav-rapport-Navs%20bedriftsunders%C3%B8kelse%202025.%20Stor%20mangel%20p%C3%A5%20folk%20med%20fagbrev.pdf,"Tabell V1: 300 (KI 150-550)"
A:P4-NO-011,behold,,https://www.nav.no/_/attachment/download/70f5589e-0dc3-4166-a20d-2de0658d8a7e%3A75794e5b17f2303980941f3834e0cedfae442a9e/04-25-Nav-rapport-Navs%20bedriftsunders%C3%B8kelse%202025.%20Stor%20mangel%20p%C3%A5%20folk%20med%20fagbrev.pdf,"Tabell V1, Lastebil- og trailersjåfører: 400 (300-550)"
B:P4-NO-011,behold,,https://www.nav.no/_/attachment/download/70f5589e-0dc3-4166-a20d-2de0658d8a7e%3A75794e5b17f2303980941f3834e0cedfae442a9e/04-25-Nav-rapport-Navs%20bedriftsunders%C3%B8kelse%202025.%20Stor%20mangel%20p%C3%A5%20folk%20med%20fagbrev.pdf,"Tabell V1: 400 (300-550)"
A:P4-NO-014,behold,,https://www.nav.no/_/attachment/download/70f5589e-0dc3-4166-a20d-2de0658d8a7e%3A75794e5b17f2303980941f3834e0cedfae442a9e/04-25-Nav-rapport-Navs%20bedriftsunders%C3%B8kelse%202025.%20Stor%20mangel%20p%C3%A5%20folk%20med%20fagbrev.pdf,"Tabell V1: 950 (KI 700-1 250)"
B:P4-NO-014,behold,,https://www.nav.no/_/attachment/download/70f5589e-0dc3-4166-a20d-2de0658d8a7e%3A75794e5b17f2303980941f3834e0cedfae442a9e/04-25-Nav-rapport-Navs%20bedriftsunders%C3%B8kelse%202025.%20Stor%20mangel%20p%C3%A5%20folk%20med%20fagbrev.pdf,"Tabell V1: 950 (KI 700-1 250)"
B:NAV2026-samlet,ikke_verifisert,"Skriv «om lag 34 000» (NAVs pressemelding); 33 750 ikke kontrollerbart",https://www.nav.no/no/nav-og-samfunn/kunnskap/analyser-fra-nav/nyheter/bedriftsundersokelsen-2026-norske-virksomheter-mangler-34-000-personer,"Pressemelding: 34 000 og 18 % med rekrutteringsproblemer; DOI 10.60847/NAV.6225 ga 403; tabellene ligger i Excel"
B:NAV2026-sjåfører-550,ikke_verifisert,,https://kompetansegapet.no/yrke/2223/card/story,"Ingen yrkestall i pressemeldingen; NAV-rapporten ga 403; Kompetansegapet viste ingen tall"
B:P4-NO-017,ikke_verifisert,,https://kompetansegapet.no/yrke/2223,"Kompetansegapet (/yrke/2223 og /card/story) viste ingen tall; NAV 2026-rapporten ga 403"
B:P4-NO-016,behold,,https://www.ela.europa.eu/sites/default/files/2026-06/annex-labour-shortages-report-ela-2025.pdf,"Heavy truck and lorry drivers: NO i mangelraden (s. 9)"
A:P4-SE-006,behold,,https://www.ela.europa.eu/sites/default/files/2026-06/annex-labour-shortages-report-ela-2025.pdf,"SE i mangelraden (s. 9); A nevner ikke at NO også står der"
B:P4-SE-008,behold,,https://www.ela.europa.eu/sites/default/files/2026-06/annex-labour-shortages-report-ela-2025.pdf,"SE i mangelraden (s. 9)"
A:P4-FI-006,behold,,https://www.ela.europa.eu/sites/default/files/2026-06/annex-labour-shortages-report-ela-2025.pdf,"Overskudd: AT, EL, FI, LU (s. 9)"
B:P4-FI-006,behold,,https://www.ela.europa.eu/sites/default/files/2026-06/annex-labour-shortages-report-ela-2025.pdf,"Overskudd: AT, EL, FI, LU; DK og IS står ikke i raden"
A:P4-SE-008,behold,,https://www.ela.europa.eu/sites/default/files/2026-06/annex-labour-shortages-report-ela-2025.pdf,"Veterinarians: SE i mangelraden (s. 17)"
B:P4-SE-010,behold,,https://www.ela.europa.eu/sites/default/files/2026-06/annex-labour-shortages-report-ela-2025.pdf,"Veterinarians: SE i mangelraden (s. 17)"
A:P4-DK-010,behold,,https://www.ela.europa.eu/sites/default/files/2026-06/annex-labour-shortages-report-ela-2025.pdf,"Veterinarians: DK i mangelraden (s. 17)"
B:P4-DK-009,behold,,https://www.ela.europa.eu/sites/default/files/2026-06/annex-labour-shortages-report-ela-2025.pdf,"Veterinarians: DK i mangelraden (s. 17)"
A:P4-NO-012,behold,,https://www.regjeringen.no/contentassets/1807e0e77eb443fbbdf53cf24a7132a9/rapport-om-tilgang-pa-veterinartjenester-i-norge-10.03.23.pdf,"Sammendrag: størst i områder med store reiseavstander og få husdyrbesetninger"
B:P4-NO-012,behold,,https://www.regjeringen.no/contentassets/1807e0e77eb443fbbdf53cf24a7132a9/rapport-om-tilgang-pa-veterinartjenester-i-norge-10.03.23.pdf,"Sammendrag bekreftet"
A:P4-NO-013,behold,,https://www.regjeringen.no/contentassets/1807e0e77eb443fbbdf53cf24a7132a9/rapport-om-tilgang-pa-veterinartjenester-i-norge-10.03.23.pdf,"S. 48: bemanning på et minimum; opplæring og smittefare"
B:P4-NO-013,behold,,https://www.regjeringen.no/contentassets/1807e0e77eb443fbbdf53cf24a7132a9/rapport-om-tilgang-pa-veterinartjenester-i-norge-10.03.23.pdf,"S. 48: sitatet er ordrett riktig"
A:P4-SE-007,behold,,https://www.regeringen.se/contentassets/5a0e209dcee242b6b2a86983c87372c3/sou-2022_58.pdf,"S. 24: brist på veterinärer och djursjukskötare"
B:P4-SE-009,behold,,https://www.regeringen.se/contentassets/5a0e209dcee242b6b2a86983c87372c3/sou-2022_58.pdf,"S. 24: sitatet er ordrett riktig"
B:SOU-mycket-svår,rett,"Fjern «mycket svår» som sitat, eller legg til en lokator som kan kontrolleres",https://www.regeringen.se/contentassets/5a0e209dcee242b6b2a86983c87372c3/sou-2022_58.pdf,"Uttrykket ikke funnet i fulltekstsøk om Distriktsveterinärernas bemanning"
A:P4-SE-001,behold,,https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2025-11-11-jordbruksforetag-och-foretagare-2025,"54 723; -23 % fra 2010"
B:P4-SE-001,behold,,https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2025-11-11-jordbruksforetag-och-foretagare-2025,"54 723; -23 % fra 2010"
A:P4-SE-002,behold,,https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2025-11-11-jordbruksforetag-och-foretagare-2025,"Drygt 40 % (2025) mot 27 % (2010); enskild firma"
B:P4-SE-002,behold,,https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2025-11-11-jordbruksforetag-och-foretagare-2025,"Drygt 40 % (2025) mot 27 % (2010)"
B:P4-SE-003,behold,,https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2026-06-05-generationsvaxling-2026,"Knappt en fjärdedel, 24 %; ramme 11 198, utvalg 2 013, ca. 1 300 svar"
B:P4-SE-004,behold,,https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2024-06-13-sysselsattning-i-jordbruket-2023,"158 300; over 86 % stadigvarande; 53 300 årsverk à 1 800 timer"
B:P4-SE-005,behold,,https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2024-06-13-sysselsattning-i-jordbruket-2023,"Inhyrd personal redovisas inte; utenlandsk arbeidskraft nästan uteslutande via bemanningsföretag"
A:P4-SE-003,behold,,https://tillvaxtverket.se/download/18.4c087c7f19e48e9a765cd56/1779377350373/livsmedelssektorns_kompetensforsorjning_en%20syntesrapport.pdf,"Kap. 2.1.2: naturbruk 24 %, sju procent eftergymnasial; primærproduksjon inkl. fiske"
A:P4-SE-004,behold,,https://tillvaxtverket.se/download/18.4c087c7f19e48e9a765cd56/1779377350373/livsmedelssektorns_kompetensforsorjning_en%20syntesrapport.pdf,"Kap. 3 (s. 24): 53 000 förvärvsarbetande, 48 200 anställda; SNI 10-12"
B:P4-SE-006,behold,,https://tillvaxtverket.se/download/18.4c087c7f19e48e9a765cd56/1779377350373/livsmedelssektorns_kompetensforsorjning_en%20syntesrapport.pdf,"Kap. 3 (s. 24): 53 000"
A:P4-SE-005,behold,,https://tillvaxtverket.se/download/18.4c087c7f19e48e9a765cd56/1779377350373/livsmedelssektorns_kompetensforsorjning_en%20syntesrapport.pdf,"Kap. 3.1: industri 31 % mot sektor 33 %; kap. 1.4.3 oppgir 31 % for hele sektoren, så rapporten er ikke konsistent"
B:P4-SE-007,behold,,https://tillvaxtverket.se/download/18.4c087c7f19e48e9a765cd56/1779377350373/livsmedelssektorns_kompetensforsorjning_en%20syntesrapport.pdf,"Som A:P4-SE-005; bruk tallet med forsiktighet"
A:P4-DK-001,behold,,https://www.dst.dk/nyt/54456,"51 676 -> 27 024; -48 %; Nyt nr. 158, 19.6.2026"
B:P4-DK-001,behold,,https://www.dst.dk/da/Statistik/emner/erhvervsliv/landbrug-gartneri-og-skovbrug/bedrifter-og-arbejdskraft-i-landbrug-og-gartneri,"27 024; -48 % fra 2005"
A:P4-DK-002,behold,,https://www.dst.dk/analyser/49360-portraet-af-danske-landmaend,"12 300 -> 7 500"
B:P4-DK-002,behold,,https://www.dst.dk/analyser/49360-portraet-af-danske-landmaend,"12 300 -> 7 500"
A:P4-DK-003,behold,,https://www.dst.dk/analyser/49360-portraet-af-danske-landmaend,"49,2 -> 53,6 år"
B:P4-DK-003,behold,,https://www.dst.dk/analyser/49360-portraet-af-danske-landmaend,"49,2 -> 53,6 år"
A:P4-DK-004,behold,,https://www.dst.dk/analyser/49360-portraet-af-danske-landmaend,"76 % erhvervsfaglig som højest fuldførte"
B:P4-DK-004,behold,,https://www.dst.dk/analyser/49360-portraet-af-danske-landmaend,"76 % erhvervsfaglig som højest fuldførte"
A:P4-DK-005,behold,,https://www.dst.dk/analysepdf/48223,"S. 6: 32 % (2008) -> 51 % (2020)"
B:P4-DK-005,behold,,https://www.dst.dk/analysepdf/48223,"S. 6: 32 % (2008) -> 51 % (2020)"
A:P4-DK-006,behold,,https://www.dst.dk/analysepdf/48223,"Tabel C s. 13: 2 844 FTE"
B:P4-DK-006,behold,,https://www.dst.dk/analysepdf/48223,"Tabel C s. 13: 2 844 FTE"
A:P4-DK-007,behold,,https://www.dst.dk/analysepdf/48223,"(2844-2008)/2844=29,4 % riktig; 71 % danske i Tabel C"
B:P4-DK-007,behold,,https://www.dst.dk/analysepdf/48223,"(2844-2008)/2844=29,4 % riktig"
A:P4-DK-008,rett,"16 % i 2020, omtrent doblet siden 2008 (2008-tallet står ikke eksplisitt)",https://www.dst.dk/analysepdf/48223,"De 8 % i kildens setning gjelder meierier i 2020"
B:P4-DK-008,behold,,https://www.dst.dk/analysepdf/48223,"16 % i 2020 og fordobling; Tabel C 84 % danske"
A:P4-DK-009,behold,,https://www.dst.dk/analysepdf/48223,"Tabel C s. 12: 12 365 FTE, 8 320 danske (67 %); 33 % er utledet og bør merkes som egen beregning"
B:P4-DK-010,behold,,https://www.dst.dk/analysepdf/48223,"S. 5: 15.000 -> 12.400; under 3.000 -> over 4.000; stemmer med A"
A:P4-FI-001,behold,,https://www.luke.fi/en/statistics/structure-of-agricultural-and-horticultural-enterprises/structure-of-agricultural-and-horticultural-enterprises-2025,"39 825; publ. 30.4.2026"
B:P4-FI-001,behold,,https://www.luke.fi/en/statistics/structure-of-agricultural-and-horticultural-enterprises/structure-of-agricultural-and-horticultural-enterprises-2025,"39 825; 84 % familiebruk"
A:P4-FI-002,behold,,https://www.luke.fi/en/statistics/agricultural-and-horticultural-labour-force/agricultural-and-horticultural-labour-force-2023,"118 000 personer; ca. 55 000 AWU; publ. 28.2.2025"
B:P4-FI-002,behold,,https://www.luke.fi/en/statistics/agricultural-and-horticultural-labour-force/agricultural-and-horticultural-labour-force-2023,"Tallene riktige; publisert 28.2.2025, ikke 2025-03"
A:P4-FI-003,behold,,https://www.luke.fi/en/statistics/agricultural-and-horticultural-labour-force/agricultural-and-horticultural-labour-force-2023,"-22 % bedrifter; ca. -24 % arbeid; produksjon ikke merkbart ned"
B:P4-FI-003,behold,,https://www.luke.fi/en/statistics/agricultural-and-horticultural-labour-force/agricultural-and-horticultural-labour-force-2023,"-22 % / ca. -24 %"
A:P4-FI-004,rett,"ca. 23 % (2 600 av litt over 11 000 gir under 23,6 %)",https://www.luke.fi/en/statistics/agricultural-and-horticultural-labour-force/agricultural-and-horticultural-labour-force-2023,"Kildetallene 2 600 og litt over 11 000 permanent employees er riktige"
B:P4-FI-004,rett,"ca. 23 % (2 600 av litt over 11 000 gir under 23,6 %)",https://www.luke.fi/en/statistics/agricultural-and-horticultural-labour-force/agricultural-and-horticultural-labour-force-2023,"Kilden sier permanent employees, ikke «mer varig innleid»"
A:P4-FI-005,behold,,https://www.luke.fi/en/statistics/agricultural-and-horticultural-labour-force/agricultural-and-horticultural-labour-force-2023,"13 200/23 000 = 57,4 %"
B:P4-FI-005,behold,,https://www.luke.fi/en/statistics/agricultural-and-horticultural-labour-force/agricultural-and-horticultural-labour-force-2023,"13 200/23 000 = 57,4 %"
A:P4-IS-001,behold,,https://statice.is/publications/news-archive/agriculture/income-statement-and-balance-sheet-for-agriculture-2008-2020/,"2 795 -> 2 421; fem grener; publ. 2.6.2022"
B:P4-IS-001,behold,,https://statice.is/publications/news-archive/agriculture/income-statement-and-balance-sheet-for-agriculture-2008-2020/,"2 795 -> 2 421; fem grener"
```
