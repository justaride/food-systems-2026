# Nordic Vision 2030 x Food Systems 2026: koblingsmatrise

**Dato:** 2026-04-29  
**Status:** Første arbeidsmatrise  
**Scope:** Lokal prosjektstatus + offisielle NMR-kilder kontrollert på nett i forrige gjennomgang.  
**Viktig avgrensning:** Dette er en intern arbeidsmatrise. Sterke claims må fortsatt bindes til primærkilde før ekstern bruk.

## Kort svar

Food Systems 2026 kan kobles tydelig til Nordic Vision 2030, men koblingen bør gjøres gjennom konkrete matnære akser, ikke bare ved å sitere visjonen. Den sterkeste koblingen er:

1. grønn omstilling: sirkulær/bio-basert økonomi, matsvinn, sidestrømmer, ressursbruk
2. konkurransekraft: nordisk verdikjede, innovasjon, resilient produksjon, data og marked
3. sosial bærekraft: sunt kosthold, matmiljø, beredskap, arbeidsliv og tilgang

## Vision 2030-prioriteter mot prosjektdata

| Vision 2030-prioritet | Matnær oversettelse | Hva vi har i prosjektet | Status | Neste handling |
|---|---|---|---|---|
| Green Nordic Region | Sirkulær og bio-basert matøkonomi | `src-92`, sirkularitetsrammeverk, sidestream-/biogassnotater, verdikjedeanalyse | Delvis | DB-refresh `src-92`; bygg sidestrøm/source pack |
| Green Nordic Region | Matsvinn og avfallsforebygging | Matsvinnutvalget, NORSUS/Matvett, Breaking Barriers, `CountryMetric.foodWastePerCapita` og matsvinnsnapshot | Sterk for Norge, intern per-capita-dekning for alle fem land | Bruk per-capita-snapshot internt; hent leddvis DK/FI/IS før ekstern verdikjedeclaim |
| Green Nordic Region | Bærekraftig produksjon og ressursbruk | Verdikjede 01-04, produksjonspanel, oats-serier, trade-groups | Delvis dataklart | Utvid med utslipp, areal, gjødsel, fôr og biogass |
| Green Nordic Region | Næringsstoffer og non-toxic cycles | NPK-/fosfornotater, biogassnotater, Oslofjord/Østersjø-problematikk | Svakt strukturert | Lag egen nutrient-loop datakø |
| Competitive Nordic Region | Nordisk innovasjon og grønn vekst | Nordic Food Innovation Summit-note, NordForsk/NKJ-notater, NCH/Nordic Innovation-strategi | Delvis | Skill policy, funding og faktisk markedsdata |
| Competitive Nordic Region | Verdikjede og markedskonsentrasjon | `nordisk-komparativ-analyse.md`, `verdikjede/10-kryss-analyse.md`, HHI-data | Sterk intern analyse | Kildebind alle HHI/markedsandeler til primærkilder før ekstern brief |
| Competitive Nordic Region | Digitalisering og data | Nordic analysis panel, trade-groups, source registry, prisdata | God start | Lag indikator-diff mot NMR Vision indicators |
| Competitive Nordic Region | Beredskap og robusthet | Selvforsyning/beredskap-notater, SEI-klimarisiko, landprofiler | Delvis | Promoter SEI/Nordic risk-kilder og landenes beredskapsstrategier |
| Socially Sustainable Nordic Region | Sunnere og mer bærekraftig kosthold | NNR2023 DB-lenket PDF, NORMO 2025 Appendix 6-uttrekk, Policy tools 2024 DB-lenket rapport | Dataklart for første kosthold/helse-pass | Bruk NORMO/NNR/Policy tools som sosial bærekraft-pakke; utvid kun med aktivitet/ulikhet hvis scope krever det |
| Socially Sustainable Nordic Region | Matmiljø og offentlig innkjøp | HORECA/offentlige måltider, Copenhagen/public kitchens, policy tools | Delvis | Koble offentlig innkjøp til virkemiddelsporet |
| Socially Sustainable Nordic Region | Arbeidsliv og rettferdig omstilling | Plattformarbeid, sesongarbeid, kjønn/matarbeid, butikkansatte | Fragmentert | Lag egen sosial bærekraft-kildepakke hvis dette skal inn i brief |
| Socially Sustainable Nordic Region | Integrasjon og nordisk samarbeid | Strategidraft, NCH/Nordic House, FJLS 2025-2030 | God strategisk relevans | Skill reell nordisk merverdi fra generell retorikk |

## Datagrunnlag som kan brukes nå

| Datapakke | Relevans for Vision 2030 | Styrke | Begrensning |
|---|---|---|---|
| `research/data/nordic/analysis-panel/nordic_harmonized_panel.csv` | Viser pris-, handels- og produksjonssignaler på tvers av Norden | Reproduserbart panel | Smalt scope; ikke full matsystemindikator |
| `research/data/nordic/analysis-panel/tables/latest_food_price_snapshot.csv` | Matprispress og sosial/økonomisk bærekraft | Direkte sammenlignbar HICP | Pris sier lite alene om ernæring/tilgang |
| `research/data/nordic/analysis-panel/tables/trade_index_snapshot.csv` | Robusthet og handelsavhengighet | Felles indeksvindu 2022-2025 | Ikke nivå-sammenlignbart |
| `research/data/nordic/analysis-panel/tables/oats_production_snapshot.csv` | Produksjonskapasitet og plantebasert potensial | Direkte sammenlignbart for FI/NO/SE | Kun havre, ikke bred matproduksjon |
| `research/data/nordic/trade-groups/normalized/trade-group-imports-annual.csv` | Importavhengighet i matvaregrupper | Dekker NO/DK/SE/FI/IS | Ulike valutaer/klassifikasjoner; best for komposisjon og utvikling |
| `research/data/nordic/trade-groups/normalized/intra-nordic-food-import-share-annual.csv` | Intra-nordisk importandel for valgt matkurv | Dekker DK/FI/IS/NO/SE med partnerland | Bruk som andel innen land; klassifikasjoner og enheter varierer |
| `research/data/nordic/food-waste/normalized/nordic-food-waste-countrymetric-snapshot.csv` | Matsvinn per capita og eksisterende ledddata fra runtime | Alle fem land har 2020/2022 per-capita total; Norge/Sverige har mer ledddata | Ikke full harmonisert verdikjedetabell for DK/FI/IS |
| `research/norden/verdikjede/10-kryss-analyse.md` | Makt, flaskehalser og systemrisiko | Sterk syntese | Må kildebindes for eksternt bruk |
| `research/norden/nordisk-komparativ-analyse.md` | Marked, selvforsyning og konkurranse | Sterk landprofil | Noen tall må primærkontrolleres |
| `research/bibliotek/nordisk/` + `research/data/nordic/normo-2025/` | NNR, NORMO, NordForsk, policykontekst og NORMO-uttrekk | God kuratert inngang; NNR er PDF-lenket og NORMO har første country extract | NORMO full PDF er ikke arkivert; aktivitet/sosial ulikhet er ikke trukket ut |

## Første kildeklassifisering

| Kilde | Anbefalt status | Kommentar |
|---|---|---|
| Our Vision 2030 / `src-165` | `db-linked` | Offisiell primærkilde er lagt inn som SourceDoc + Document |
| Action plan for Vision 2030 / `src-166` | `db-linked` | Trengs for 12 mål og operasjonalisering |
| Nordic indicators for Our Vision 2030 / `src-167` | `db-linked` | Klar for maskinlesbar indikatoruttrekk som neste steg |
| Status Report 2023 / `src-168` | `db-linked-context-source` | Bra for overordnet status, ikke matsystemspesifikk nok alene |
| FJLS Co-operation Programme 2025-2030 / `src-169` | `db-linked-integrer-nå` | Mest direkte for mat, fiskeri, jordbruk, skog og bioøkonomi |
| Nordic Bioeconomy Programme / `src-92` | `db-refreshed` | Statisk kildepost, lokal kildefil, Document.filePath og SourceRef er reparert |
| Policy tools for sustainable and healthy eating | `db-linked` | `Report norden-policy-2024` og `SourceDoc src-food-d760f6d96053` peker på samme PDF-`Document`; relevant for forbruk og virkemidler |
| Breaking Barriers / nordisk matsvinn | `db-linked` | `Report sirkularitet-matsvinn-2024` og `SourceDoc src-food-8047a53676d7` peker på samme PDF-`Document`; relevant for waste prevention |
| NNR 2023 | `db-linked` | `Report nnr2023-nordic-nutrition-recommendations` og `SourceDoc src-food-nnr2023` peker på samme PDF-`Document`; normativ kostholdskilde |
| NORMO 2025 | `db-linked-countrymetrics` | `Report normo-2025-nordic-monitoring` peker på lokal note-`Document`; Appendix 6 er arkivert og 57 `CountryMetric`-rader er upsertet |

## Gap mot Food Systems 2026

| Gap | Hvorfor det betyr noe | Foreslått rute |
|---|---|---|
| Full PDF-arkiv mangler for noen NMR-kilder | Kildene er DB-lenket, men lokale filer er korte source snapshots, ikke full PDF-arkiv | Arkiver PDF-er hvis ekstern leveranse krever fulltekstbevis |
| NMR-indikatorene er mappet, men ikke fullintegrert | `research/norden/nordic-vision-2030-indicator-map-2026-04-29.csv` viser 45 indikatorer, men de fleste mangler dataintegrasjon | Bruk CSV-en som arbeidskø for P1/P2-datapakker |
| Sirkulær bioøkonomi er ikke tallfestet bredt | Risiko for at "circular" blir retorikk | Bygg sidestrøm, biogass, næringsstoff og fôr-source pack |
| Kosthold/helse er bare førsteuttrukket i `CountryMetric` | Sosial bærekraft har nå et målbart grunnlag, men mangler aktivitet, ulikhet og full child diet hvis dette blir hovedspor | Bruk NORMO-uttrekket nå; utvid med aktivitet/ulikhet senere |
| Matsvinn er sterkest for Norge | Nordisk sammenligning har per-capita total, men mangler harmoniserte ledddata for flere land | Bruk snapshot internt; hent/normaliser DK/FI/IS primærkilder for leddvis ekstern bruk |
| Markedsmaktdata er sterk syntese, men må kildebindes | Ekstern bruk krever primærkilder | Knytt HHI/markedsandeler til rapporter/årsrapporter |
| Arbeidsliv/sosial bærekraft er fragmentert | Vision 2030 har sosial dimensjon | Avgjør om dette skal inn i scope eller holdes som eget spor |

## Anbefalt første syntese

Food Systems 2026 bør posisjonere Nordic Vision 2030 slik:

> Nordic Vision 2030 gir ikke i seg selv en matsystemanalyse. Den gir et styrende nordisk policykrav: grønn, konkurransedyktig og sosialt bærekraftig omstilling. Food Systems 2026 kan gjøre dette operativt ved å måle hvor nordiske matsystemer faktisk står på sirkularitet, matsvinn, ressursbruk, matpriser, handel, produksjon, markedsstruktur, kosthold og beredskap.

## Neste konkrete steg

1. Første interne brief er opprettet i `research/norden/nordic-vision-2030-food-systems-brief-2026-04-29.md`.
2. Økologisk areal er integrert som `CountryMetric.organicAgriculture`; intra-nordisk importandel er runtime-seedet for DK/FI/IS/NO/SE som `CountryMetric.intraNordicImportShare`; NORMO 2025 er førsteuttrukket som `dietFrequency` og `healthOutcome`; matsvinnsnapshot finnes for alle fem land; prioriter videre P1-datapakkene utslipp/fotavtrykk, materialfotavtrykk og mattilgang.
3. Arkiver PDF-er for NMR-kildene hvis briefen skal være ekstern og siterbar på dokumentnivå.
