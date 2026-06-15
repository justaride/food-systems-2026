---
tittel: Deep Research - P-VALIO-1 - finsk forbruks-/fôrstatistikk
status: Kontrollert intern kjoring - lukket for datasettgrunnlag, med caveat
eier: Gabriel
dato: 2026-06-13
scope: Rene desk-datasett for finsk fôrforbruk/-bruk som motstykke til importpreviewen i Valio-caset. Ingen allokering til Valio, melkekjede eller enkeltaktør.
relaterte_filer:
  - docs/project/analysis/case-avsjekk/avsjekk-03-valio-finland-2026-06-12.md
  - docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md
  - research/external/dro-1206/downloads/valio/
---

# Deep Research - P-VALIO-1

## 0. Kort dom

P-VALIO-1 er **lukket som datasettgrunnlag**, ikke som Valio-spesifikk fôrkurv.

Det finnes tre brukbare nivåer:

1. **Ruokavirasto** lukker nasjonal fôrsektor-statistikk for fôrblandinger, fôrråvareproduksjon og fôrråvareimport. Nyeste årsrapport gir 2025 foreløpig + 2024; separate statistikk-PDF-er gir 2023 og eldre. GMO-soya finnes bare som figur-PDF per nå.
2. **Luke PxWeb** lukker forbrukssiden bedre: årlige kjøp fra gård, industriell bruk og kornbalanse med fôrbrukskategorier kan trekkes via API og er lagret som CSV.
3. **Tulli/Uljas** lukker autorisert importkontroll: Uljas-totalene for 1201, 2304, 230641 og 230649 avviker bare på kg-nivå fra intern Comtrade-preview. Det er ingen materiell konflikt.

**Ikke-si:** Importvolumene er nasjonal import, ikke fôrbruk i melkekjeden. Luke/Ruokavirasto beskriver nasjonal fôrsektor og industriell bruk, ikke Valio-andeler.

## 1. Kilde- og tilgjengelighetsledger

| Kilde | Eksakt fil/tabell | Dekning | API/CSV-tilgjengelighet | Lokal kopi | Datakvalitet |
|---|---|---|---|---|---|
| Ruokavirasto, statistikkside | `Valvontaraportteja ja tilastoja rehuista` | Indeks for rapporter, produksjon, import, GM-soya | HTML-indeks; datatabeller primært PDF. Siden peker også til Avoin tieto for kontrollprøver, men ikke til samlet fôrproduksjons-API. | PDF/TXT under `research/external/dro-1206/downloads/valio/` | God kildeforankring; ikke API-vennlig. Siden oppdatert 20.4.2026. |
| Ruokavirasto | `Rehuvalvonnan raportti 2025` | 2025 foreløpig + 2024 for fôrblandinger, råvarer, import/eksport | PDF/tekstuttrekk; ikke CSV funnet | `ruokavirasto-rehuvalvonta-2025.pdf/.txt` | God for 2024/2025; 2025 er foreløpig. |
| Ruokavirasto | `Tuotantoeläinten rehuseosten valmistus 2011-2023` | Fôrblandingsproduksjon per dyreart 2011-2023 | PDF/tekstuttrekk; tabellnavn på nettsiden ser Excel-aktig ut, men URL er PDF | `ruokavirasto-tuotantoelainten-rehuseosten-valmistus-2011-2023.pdf/.txt` | God historikk; enkelte celler skjult når produsenttall <3. |
| Ruokavirasto | `Rehuaineiden valmistus 2022-2023` og `Rehuaineiden, rehun lisäaineiden ja esiseosten tuonti 2022-2023` | Fôrråvareproduksjon og -import 2022-2023 | PDF/tekstuttrekk | `ruokavirasto-rehuaineiden-valmistus-2022-2023.*`, `ruokavirasto-rehuaineet-lisaaineet-esiseokset-tuonti-2022-2023.*` | God, men PDF-tabelllayout krever kontroll ved import til tabell. |
| Ruokavirasto | `Muuntogeenisen soijan tuonti 2008-2023` | GM-soyaprodukter til fôrbruk, figur | Chart-only PDF | `ruokavirasto-gm-soija-tuonti-rehukayttoon-2008-2023.*` | Åpen kilde, men tallene er ikke maskinlest fra PDF-teksten. Må digitiseres manuelt hvis tall skal brukes. |
| Luke PxWeb | `maa/vilvar/0300_vilvar.px` | Årlige kjøp fra gård av korn, protein- og oljevekster | API ja; CSV lagret | `luke-vilvar-annual-purchases-2022-2025.csv` | Sterk. Oppdatert i API 2026-02-13. |
| Luke PxWeb | `maa/vilvar/0600_vilvar.px` | Årlig industriell bruk, inkl. `Used for feed` | API ja; CSV lagret | `luke-vilvar-annual-industrial-use-2022-2025.csv` | Sterk, men blanke celler må ikke tolkes som null uten Luke-avklaring. |
| Luke PxWeb | `maa/viltas/0100_viltas.px` | Kornbalanse, inkl. fôrbruk totalt/industri/gård | API ja; CSV lagret | `luke-cereals-balance-feed-use-2021-2024-cropyears.csv` | Sterk for korn; dekker ikke oljevekster/proteinvekster i balansearket. |
| Tulli/Uljas | `/DATABASE/01 ULKOMAANKAUPPATILASTOT/01 CN/ULJAS_CN2` | CN-import 2015-2025, total og opprinnelsesland | GET API ja; CSV lagret | `tulli-uljas-cn-feed-total-imports-2015-2025.csv`, `tulli-uljas-cn-feed-origin-imports-2022-2025.csv` | Sterk. Uljas varsler at data før 2026 ligger i gammel kube og oppdateres til endelige 2025-tall publiseres 28.8.2026. |

## 2. Ruokavirasto - fôrsektor, produksjon og import

Definisjon: Ruokavirasto oppgir at mengdene bygger på fôrbransjeaktørenes årsinnmeldinger. I 2025-rapporten er 2025-tallene foreløpige og kan bli oppdatert.

| metrikk | verdi | enhet | år | geografi | metode/definisjon | kilde | URL | locator | datakvalitet |
|---|---:|---|---:|---|---|---|---|---|---|
| Produksjon av fôrblandinger til produksjonsdyr | 1 632 | mill. kg | 2025 | Finland | Foreløpig, inkl. innenlands produksjon; ikke rahtisekoittajat/turkisrehusekoittamot i historikkfil | Ruokavirasto 2025 | https://www.ruokavirasto.fi/globalassets/elaimet/rehut/raportit/rehuvalvonnan_vasuraportti_2025_valmis.pdf | Tabell 1, s. 5 | Foreløpig |
| Produksjon av fôrblandinger til produksjonsdyr | 1 619 | mill. kg | 2024 | Finland | Årsinnmeldinger | Ruokavirasto 2025 | samme | Tabell 1, s. 5 | God |
| Produksjon av fôrblandinger til produksjonsdyr | 1 376,886 | mill. kg | 2023 | Finland | Årsinnmeldinger, totalrad | Ruokavirasto statistikk-PDF | https://www.ruokavirasto.fi/globalassets/elaimet/rehut/tilastot/tuotantoe_rehuseosten_valm_070624.pdf | s. 5/5, `REHUSEOKSET YHTEENSÄ` | God |
| Fôrblandinger, storfe | 645,6 | mill. kg | 2025 | Finland | Dyreartskategori | Ruokavirasto 2025 | samme | Tabell 1, s. 5 | Foreløpig |
| Fôrblandinger, storfe | 648,3 | mill. kg | 2024 | Finland | Dyreartskategori | Ruokavirasto 2025 | samme | Tabell 1, s. 5 | God |
| Fôrblandinger, storfe | 650,022 | mill. kg | 2023 | Finland | Dyreartskategori | Ruokavirasto statistikk-PDF | samme som over | s. 3/5, `NAUTAKARJA YHTEENSÄ` | God |
| Fôrblandinger, fjørfe | 463,8 | mill. kg | 2025 | Finland | Dyreartskategori | Ruokavirasto 2025 | samme | Tabell 1, s. 5 | Foreløpig |
| Fôrblandinger, fjørfe | 450,3 | mill. kg | 2024 | Finland | Dyreartskategori | Ruokavirasto 2025 | samme | Tabell 1, s. 5 | God |
| Fôrblandinger, fjørfe | 429,474 | mill. kg | 2023 | Finland | Dyreartskategori | Ruokavirasto statistikk-PDF | samme som over | s. 1/5, `SIIPIKARJA YHTEENSÄ` | God |
| Fôrblandinger, svin | 384,1 | mill. kg | 2025 | Finland | Dyreartskategori | Ruokavirasto 2025 | samme | Tabell 1, s. 5 | Foreløpig |
| Fôrblandinger, svin | 376,7 | mill. kg | 2024 | Finland | Dyreartskategori | Ruokavirasto 2025 | samme | Tabell 1, s. 5 | God; markant nivåskift fra 2023, ikke tolket her |
| Fôrblandinger, svin | 222,555 | mill. kg | 2023 | Finland | Dyreartskategori | Ruokavirasto statistikk-PDF | samme som over | s. 2/5, `SIAT YHTEENSÄ` | God; nivåskift mot 2024 må ikke overfortolkes uten metodeavklaring |
| Import av fôrblandinger til produksjonsdyr, ekskl. fiskefôr | 25,1 | mill. kg | 2025 | Finland | Tabellfotnote: `pl. kalanrehut` | Ruokavirasto 2025 | samme | Tabell 1, s. 5 | Foreløpig |
| Import av fôrblandinger til produksjonsdyr, ekskl. fiskefôr | 23,2 | mill. kg | 2024 | Finland | Tabellfotnote: `pl. kalanrehut` | Ruokavirasto 2025 | samme | Tabell 1, s. 5 | God |
| Import av fôrblandinger til produksjonsdyr, ekskl. fiskefôr | 18,877 | mill. kg | 2023 | Finland | Importland, produksjonsdyr uten fiskefôr | Ruokavirasto statistikk-PDF | https://www.ruokavirasto.fi/globalassets/elaimet/rehut/tilastot/tuotantoe_rehuseosten_tuonti_050724.pdf | s. 1, `Tuonti yhteensä` | God |
| Produksjon av fôrråvarer | 1 185 | mill. kg | 2025 | Finland | Fôrråvarer brukt hovedsakelig i fôrproduksjon | Ruokavirasto 2025 | samme | Tabell 2, s. 6 | Foreløpig |
| Produksjon av fôrråvarer | 1 375 | mill. kg | 2024 | Finland | Fôrråvarer brukt hovedsakelig i fôrproduksjon | Ruokavirasto 2025 | samme | Tabell 2, s. 6 | God |
| Produksjon av fôrråvarer | 1 146,597 | mill. kg | 2023 | Finland | Sum plante-, dyre- og andre fôrråvarer i separat statistikk | Ruokavirasto statistikk-PDF | https://www.ruokavirasto.fi/globalassets/elaimet/rehut/tilastot/valmistus_rehuaineet2223.pdf | s. 1, sum av kategorirader | Beregnet sum fra kilde-PDF |
| Produksjon av plantebaserte fôrråvarer | 576,6 | mill. kg | 2025 | Finland | Plantebaserte fôrråvarer; inkluderer ikke primærproduksjon av fôrvekster | Ruokavirasto 2025 | samme | Tabell 2, s. 6 | Foreløpig |
| Produksjon av plantebaserte fôrråvarer | 630,9 | mill. kg | 2024 | Finland | Samme | Ruokavirasto 2025 | samme | Tabell 2, s. 6 | God |
| Produksjon av plantebaserte fôrråvarer | 662,569 | mill. kg | 2023 | Finland | Årsinnmeldinger | Ruokavirasto statistikk-PDF | samme som over | s. 1, `Kasviperäiset rehuaineet` | God |
| Import av fôrråvarer | 670,4 | mill. kg | 2025 | Finland | Fôrråvarer, alle typer | Ruokavirasto 2025 | samme | Tabell 2, s. 6 | Foreløpig |
| Import av fôrråvarer | 640,7 | mill. kg | 2024 | Finland | Fôrråvarer, alle typer | Ruokavirasto 2025 | samme | Tabell 2, s. 6 | God |
| Import av fôrråvarer | 547,373 | mill. kg | 2023 | Finland | Importland, årsinnmeldinger | Ruokavirasto statistikk-PDF | https://www.ruokavirasto.fi/globalassets/elaimet/rehut/tilastot/tuonti_rehuaineet_ja_lisaaineet2223_100724.pdf | s. 2, `Tuonti yhteensä` | God |
| Import av plantebaserte fôrråvarer | 548,9 | mill. kg | 2025 | Finland | Plantebasert del av fôrråvareimport | Ruokavirasto 2025 | samme | Tabell 2, s. 6 | Foreløpig |
| Import av plantebaserte fôrråvarer | 527,6 | mill. kg | 2024 | Finland | Samme | Ruokavirasto 2025 | samme | Tabell 2, s. 6 | God |
| Import av plantebaserte fôrråvarer | 477,474 | mill. kg | 2023 | Finland | Samme | Ruokavirasto statistikk-PDF | samme som over | s. 2, `Kasviperäiset` | God |
| GM-soyaprodukter til fôrbruk | tom - ikke maskinlest tall | mill. kg / % | 2008-2023 | Finland | Figur; ekskluderer soyabønner videreforedlet i Finland til fôrbruk | Ruokavirasto figur-PDF | https://www.ruokavirasto.fi/globalassets/elaimet/rehut/tilastot/tuonti_gmsoija_23_050724.pdf | Figur `SOIJATUOTTEIDEN TUONTI REHUKÄYTTÖÖN`, oppdatert 5.7.2024 | Krever manuell digitising/OCR; ikke brukt kvantitativt |

## 3. Luke - kjøp, industriell bruk og kornbalanse

Luke-tabellene ble trukket fra PxWeb API. Fullt uttrekk ligger i de tre lokale CSV-ene listet i kildeledgeren.

### 3.1 Årlige kjøp fra gård

Tabellsti: `https://statdb.luke.fi/PxWeb/api/v1/en/LUKE/maa/vilvar/0300_vilvar.px`.

| metrikk | verdi | enhet | år | geografi | metode/definisjon | kilde | URL | locator | datakvalitet |
|---|---:|---|---:|---|---|---|---|---|---|
| Kjøp fra gård, fôrhvete | 170 985 | 1000 kg | 2023 | Finland | `TOTAL (production method)`, `.Feed wheat` | Luke PxWeb | https://statdb.luke.fi/PxWeb/api/v1/en/LUKE/maa/vilvar/0300_vilvar.px | `INFO=KGT`, `A=2023`, `LJ=VEHNRE` | API |
| Kjøp fra gård, fôrhvete | 228 770 | 1000 kg | 2024 | Finland | Samme | Luke PxWeb | samme | `A=2024`, `LJ=VEHNRE` | API; matcher Luke-release |
| Kjøp fra gård, fôrhvete | 279 254 | 1000 kg | 2025 | Finland | Samme | Luke PxWeb | samme | `A=2025`, `LJ=VEHNRE` | API |
| Kjøp fra gård, fôr-/annen bygg | 416 912 | 1000 kg | 2023 | Finland | `Feed and other barley` | Luke PxWeb | samme | `LJ=OHRARE_MUU` | API |
| Kjøp fra gård, fôr-/annen bygg | 383 959 | 1000 kg | 2024 | Finland | Samme | Luke PxWeb | samme | `A=2024`, `LJ=OHRARE_MUU` | API; matcher release |
| Kjøp fra gård, fôr-/annen bygg | 386 552 | 1000 kg | 2025 | Finland | Samme | Luke PxWeb | samme | `A=2025`, `LJ=OHRARE_MUU` | API |
| Kjøp fra gård, fôrhavre | 281 773 | 1000 kg | 2023 | Finland | `.Feed oats` | Luke PxWeb | samme | `LJ=KAURRE` | API |
| Kjøp fra gård, fôrhavre | 285 144 | 1000 kg | 2024 | Finland | Samme | Luke PxWeb | samme | `A=2024`, `LJ=KAURRE` | API; matcher release |
| Kjøp fra gård, fôrhavre | 236 708 | 1000 kg | 2025 | Finland | Samme | Luke PxWeb | samme | `A=2025`, `LJ=KAURRE` | API |
| Kjøp fra gård, ryps/raps | 37 003 | 1000 kg | 2023 | Finland | `Turnip rape and rape` | Luke PxWeb | samme | `LJ=RYRA` | API |
| Kjøp fra gård, ryps/raps | 40 917 | 1000 kg | 2024 | Finland | Samme | Luke PxWeb | samme | `A=2024`, `LJ=RYRA` | API; matcher release avrundet til 41 mill. kg |
| Kjøp fra gård, ryps/raps | 39 292 | 1000 kg | 2025 | Finland | Samme | Luke PxWeb | samme | `A=2025`, `LJ=RYRA` | API |
| Kjøp fra gård, erter | 48 729 | 1000 kg | 2023 | Finland | `Peas` | Luke PxWeb | samme | `LJ=HERN` | API |
| Kjøp fra gård, erter | 43 575 | 1000 kg | 2024 | Finland | Samme | Luke PxWeb | samme | `A=2024`, `LJ=HERN` | API; matcher release avrundet til 44 mill. kg |
| Kjøp fra gård, erter | 50 345 | 1000 kg | 2025 | Finland | Samme | Luke PxWeb | samme | `A=2025`, `LJ=HERN` | API |
| Kjøp fra gård, hestebønner | 7 963 | 1000 kg | 2023 | Finland | `Broad bean` | Luke PxWeb | samme | `LJ=HARPAP` | API |
| Kjøp fra gård, hestebønner | 5 046 | 1000 kg | 2024 | Finland | Samme | Luke PxWeb | samme | `A=2024`, `LJ=HARPAP` | API; matcher release avrundet til 5 mill. kg |
| Kjøp fra gård, hestebønner | 5 290 | 1000 kg | 2025 | Finland | Samme | Luke PxWeb | samme | `A=2025`, `LJ=HARPAP` | API |

### 3.2 Industriell bruk - feed use

Tabellsti: `https://statdb.luke.fi/PxWeb/api/v1/en/LUKE/maa/vilvar/0600_vilvar.px`.

| metrikk | verdi | enhet | år | geografi | metode/definisjon | kilde | URL | locator | datakvalitet |
|---|---:|---|---:|---|---|---|---|---|---|
| Industriell bruk til fôr, hvete | 166 853 | 1000 kg | 2023 | Finland | `KAYTT=REHUK`, `LJ=VEHN` | Luke PxWeb | https://statdb.luke.fi/PxWeb/api/v1/en/LUKE/maa/vilvar/0600_vilvar.px | `Used for feed` | API |
| Industriell bruk til fôr, hvete | 202 479 | 1000 kg | 2024 | Finland | Samme | Luke PxWeb | samme | `A=2024`, `LJ=VEHN` | API |
| Industriell bruk til fôr, hvete | 223 702 | 1000 kg | 2025 | Finland | Samme | Luke PxWeb | samme | `A=2025`, `LJ=VEHN` | API |
| Industriell bruk til fôr, bygg | 175 018 | 1000 kg | 2023 | Finland | `LJ=OHRA` | Luke PxWeb | samme | `Used for feed` | API |
| Industriell bruk til fôr, bygg | 171 819 | 1000 kg | 2024 | Finland | Samme | Luke PxWeb | samme | `A=2024`, `LJ=OHRA` | API |
| Industriell bruk til fôr, bygg | 157 922 | 1000 kg | 2025 | Finland | Samme | Luke PxWeb | samme | `A=2025`, `LJ=OHRA` | API |
| Industriell bruk til fôr, havre | 227 651 | 1000 kg | 2023 | Finland | `LJ=KAUR` | Luke PxWeb | samme | `Used for feed` | API |
| Industriell bruk til fôr, havre | 203 286 | 1000 kg | 2024 | Finland | Samme | Luke PxWeb | samme | `A=2024`, `LJ=KAUR` | API |
| Industriell bruk til fôr, havre | 225 148 | 1000 kg | 2025 | Finland | Samme | Luke PxWeb | samme | `A=2025`, `LJ=KAUR` | API |
| Industriell bruk til fôr, erter | tom i API | 1000 kg | 2023 | Finland | `LJ=HERN` | Luke PxWeb | samme | `A=2023`, `KAYTT=REHUK` | Blank celle; ikke tolket som null |
| Industriell bruk til fôr, erter | 33 273 | 1000 kg | 2024 | Finland | Samme | Luke PxWeb | samme | `A=2024`, `LJ=HERN` | API; matcher total industribruk for erter i release |
| Industriell bruk til fôr, erter | 34 509 | 1000 kg | 2025 | Finland | Samme | Luke PxWeb | samme | `A=2025`, `LJ=HERN` | API |
| Industriell bruk til fôr, hestebønner | tom i API | 1000 kg | 2023 | Finland | `LJ=HARPAP` | Luke PxWeb | samme | `A=2023`, `KAYTT=REHUK` | Blank celle; ikke tolket som null |
| Industriell bruk til fôr, hestebønner | 7 671 | 1000 kg | 2024 | Finland | Samme | Luke PxWeb | samme | `A=2024`, `LJ=HARPAP` | API |
| Industriell bruk til fôr, hestebønner | tom i API | 1000 kg | 2025 | Finland | Samme | Luke PxWeb | samme | `A=2025`, `KAYTT=REHUK` | Blank celle; ikke tolket som null |
| Industriell bruk til fôr, ryps/raps | tom i API | 1000 kg | 2023-2025 | Finland | `LJ=RYRA` | Luke PxWeb | samme | `KAYTT=REHUK`, alle tre år | Blank celle; ikke grunnlag for å si null bruk |
| Industriell bruk til fôr, soya | tom i API | 1000 kg | 2023-2025 | Finland | `LJ=SOIJ` | Luke PxWeb | samme | `KAYTT=REHUK`, alle tre år | Blank celle; soyaimport må håndteres via handel/Ruokavirasto, ikke denne brukstabellen |

### 3.3 Kornbalanse - fôrbruk

Tabellsti: `https://statdb.luke.fi/PxWeb/api/v1/en/LUKE/maa/viltas/0100_viltas.px`.

| metrikk | verdi | enhet | år | geografi | metode/definisjon | kilde | URL | locator | datakvalitet |
|---|---:|---|---:|---|---|---|---|---|---|
| Korn brukt som fôr, total | 1 633,6 | mill. kg | 2022/23 | Finland | `TASE=REHKAYTT_YHT`, crop year | Luke PxWeb | https://statdb.luke.fi/PxWeb/api/v1/en/LUKE/maa/viltas/0100_viltas.px | `LJ=VILJ` | API |
| Korn brukt som fôr, total | 1 542,6 | mill. kg | 2023/24 | Finland | Samme | Luke PxWeb | samme | `SATOA=2023` | API |
| Korn brukt som fôr, total | 1 540,0 | mill. kg | 2024/25 | Finland | Samme | Luke PxWeb | samme | `SATOA=2024` | API |
| Hvete brukt som fôr | 326,3 | mill. kg | 2022/23 | Finland | Kornbalanse | Luke PxWeb | samme | `LJ=VEHN`, `REHKAYTT_YHT` | API |
| Hvete brukt som fôr | 351,0 | mill. kg | 2023/24 | Finland | Kornbalanse | Luke PxWeb | samme | `LJ=VEHN`, `REHKAYTT_YHT` | API |
| Hvete brukt som fôr | 366,2 | mill. kg | 2024/25 | Finland | Kornbalanse | Luke PxWeb | samme | `LJ=VEHN`, `REHKAYTT_YHT` | API |
| Bygg brukt som fôr | 832,8 | mill. kg | 2022/23 | Finland | Kornbalanse | Luke PxWeb | samme | `LJ=OHRA`, `REHKAYTT_YHT` | API |
| Bygg brukt som fôr | 758,1 | mill. kg | 2023/24 | Finland | Kornbalanse | Luke PxWeb | samme | `LJ=OHRA`, `REHKAYTT_YHT` | API |
| Bygg brukt som fôr | 759,4 | mill. kg | 2024/25 | Finland | Kornbalanse | Luke PxWeb | samme | `LJ=OHRA`, `REHKAYTT_YHT` | API |
| Havre brukt som fôr | 471,5 | mill. kg | 2022/23 | Finland | Kornbalanse | Luke PxWeb | samme | `LJ=KAUR`, `REHKAYTT_YHT` | API |
| Havre brukt som fôr | 432,4 | mill. kg | 2023/24 | Finland | Kornbalanse | Luke PxWeb | samme | `LJ=KAUR`, `REHKAYTT_YHT` | API |
| Havre brukt som fôr | 413,1 | mill. kg | 2024/25 | Finland | Kornbalanse | Luke PxWeb | samme | `LJ=KAUR`, `REHKAYTT_YHT` | API |

## 4. Tulli/Uljas - autorisert importserie

API-parametre brukt:

| Felt | Verdi |
|---|---|
| Base | `https://uljas.tulli.fi/uljas/graph/api.aspx` |
| Kube | `/DATABASE/01 ULKOMAANKAUPPATILASTOT/01 CN/ULJAS_CN2` |
| Metadata | `atype=dims`, `atype=class` |
| Data | `atype=data&konv=json` |
| Produkt | `Classification of Products CN=<CN4>` for 1201, 1205, 2304; `Classification of Products CN6=<CN6>` for 230641, 230649, 071310, 071350 |
| Tid | `Year=2015` ... `Year=2025` |
| Total | `Country=AA` |
| Opprinnelsesland | `Country==ALL` |
| Flow | `Flow=1` = Imports by countries of origin |
| Mengde | `Indicators=V3` = Quantity / net kg |

Uljas-dokumentasjonen sier at API-et støtter CSV, JSON, JSON-STAT og XML; at queryer kan gjøres med GET/POST; og at data før 2026 ligger i gamle kuber til endelige 2025-data publiseres 28.8.2026.

### 4.1 Importtotaler

Full 2015-2025-serie ligger i `tulli-uljas-cn-feed-total-imports-2015-2025.csv`.

| metrikk | verdi | enhet | år | geografi | metode/definisjon | kilde | URL | locator | datakvalitet |
|---|---:|---|---:|---|---|---|---|---|---|
| 1201 soyabønner, import | 25 351 466 | kg | 2022 | Finland | CN4, total opprinnelse | Tulli/Uljas | https://uljas.tulli.fi/uljas/graph/api.aspx | `CN=1201`, `Country=AA`, `Flow=1`, `V3` | API |
| 1201 soyabønner, import | 20 562 651 | kg | 2023 | Finland | Samme | Tulli/Uljas | samme | samme | API |
| 1201 soyabønner, import | 5 958 444 | kg | 2024 | Finland | Samme | Tulli/Uljas | samme | samme | API |
| 1201 soyabønner, import | 5 778 949 | kg | 2025 | Finland | Samme; 2025 kan være foreløpig til 28.8.2026 | Tulli/Uljas | samme | samme | API/provisional caveat |
| 2304 soyamel/-kake, import | 143 763 783 | kg | 2022 | Finland | CN4, total opprinnelse | Tulli/Uljas | samme | `CN=2304`, `Country=AA` | API |
| 2304 soyamel/-kake, import | 87 269 531 | kg | 2023 | Finland | Samme | Tulli/Uljas | samme | samme | API |
| 2304 soyamel/-kake, import | 124 421 787 | kg | 2024 | Finland | Samme | Tulli/Uljas | samme | samme | API |
| 2304 soyamel/-kake, import | 127 608 382 | kg | 2025 | Finland | Samme; 2025 caveat | Tulli/Uljas | samme | samme | API/provisional caveat |
| 230641 raps-/rypsmel lav erukasyre, import | 214 112 472 | kg | 2022 | Finland | CN6, total opprinnelse | Tulli/Uljas | samme | `CN6=230641`, `Country=AA` | API |
| 230641 raps-/rypsmel lav erukasyre, import | 217 552 724 | kg | 2023 | Finland | Samme | Tulli/Uljas | samme | samme | API |
| 230641 raps-/rypsmel lav erukasyre, import | 216 302 676 | kg | 2024 | Finland | Samme | Tulli/Uljas | samme | samme | API |
| 230641 raps-/rypsmel lav erukasyre, import | 199 217 593 | kg | 2025 | Finland | Samme; 2025 caveat | Tulli/Uljas | samme | samme | API/provisional caveat |
| 230649 annet raps-/rypsmel, import | 20 590 306 | kg | 2022 | Finland | CN6, total opprinnelse | Tulli/Uljas | samme | `CN6=230649`, `Country=AA` | API |
| 230649 annet raps-/rypsmel, import | 25 209 360 | kg | 2023 | Finland | Samme | Tulli/Uljas | samme | samme | API |
| 230649 annet raps-/rypsmel, import | 32 324 419 | kg | 2024 | Finland | Samme | Tulli/Uljas | samme | samme | API |
| 230649 annet raps-/rypsmel, import | 13 218 439 | kg | 2025 | Finland | Samme; 2025 caveat | Tulli/Uljas | samme | samme | API/provisional caveat |
| 1205 raps-/rypsfrø, import | 100 880 088 | kg | 2022 | Finland | CN4, total opprinnelse | Tulli/Uljas | samme | `CN=1205`, `Country=AA` | API |
| 1205 raps-/rypsfrø, import | 121 434 491 | kg | 2023 | Finland | Samme | Tulli/Uljas | samme | samme | API |
| 1205 raps-/rypsfrø, import | 137 108 531 | kg | 2024 | Finland | Samme | Tulli/Uljas | samme | samme | API |
| 1205 raps-/rypsfrø, import | 160 699 354 | kg | 2025 | Finland | Samme; 2025 caveat | Tulli/Uljas | samme | samme | API/provisional caveat |
| 071310 erter, tørkede/skrellede, import | 781 941 | kg | 2024 | Finland | CN6, total opprinnelse | Tulli/Uljas | samme | `CN6=071310`, `Country=AA` | API |
| 071350 hestebønner/bønner, tørkede/skrellede, import | 2 327 953 | kg | 2024 | Finland | CN6, total opprinnelse | Tulli/Uljas | samme | `CN6=071350`, `Country=AA` | API |

### 4.2 Opprinnelsesland, eksempel 2024

Full 2022-2025-opprinnelsesland ligger i `tulli-uljas-cn-feed-origin-imports-2022-2025.csv`.

| kode | topp opprinnelsesland 2024 | kg | datakvalitet |
|---|---|---:|---|
| 2304 | Tyskland | 64 103 153 | API, `Country==ALL` |
| 2304 | Nederland | 49 420 259 | API |
| 2304 | Norge | 4 707 309 | API |
| 230641 | Tyskland | 146 223 099 | API |
| 230641 | Polen | 41 951 480 | API |
| 230641 | Estland | 21 678 600 | API |
| 230649 | Tyskland | 22 271 108 | API |
| 230649 | Nederland | 5 124 655 | API |
| 230649 | Danmark | 2 640 620 | API |
| 1201 | Ukraina | 3 678 174 | API |
| 1201 | Østerrike | 1 581 089 | API |
| 1201 | Canada | 565 888 | API |
| 1205 | Latvia | 76 935 365 | API |
| 1205 | Litauen | 40 516 064 | API |
| 1205 | Estland | 15 524 249 | API |
| 071310 | Estland | 329 897 | API |
| 071310 | New Zealand | 121 575 | API |
| 071310 | Tyskland | 87 445 | API |
| 071350 | Estland | 2 099 270 | API |
| 071350 | Sverige | 110 304 | API |
| 071350 | Danmark | 96 610 | API |

### 4.3 Kontroll mot intern Comtrade-preview

Intern Comtrade-preview er fra `docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md` og `avsjekk-03`. Kontrollfil: `tulli-uljas-vs-internal-comtrade-preview-2022-2024.csv`.

| kode | år | intern Comtrade-preview kg | Uljas kg | avvik kg | avvik % | dom |
|---|---:|---:|---:|---:|---:|---|
| 1201 | 2022 | 25 351 466 | 25 351 466 | 0 | 0,000000 | Match |
| 1201 | 2023 | 20 562 651 | 20 562 651 | 0 | 0,000000 | Match |
| 1201 | 2024 | 5 958 444 | 5 958 444 | 0 | 0,000000 | Match |
| 2304 | 2022 | 143 763 833 | 143 763 783 | -50 | -0,000035 | Kg-nivå; ikke materiell |
| 2304 | 2023 | 87 269 515 | 87 269 531 | 16 | 0,000018 | Kg-nivå; ikke materiell |
| 2304 | 2024 | 124 421 830 | 124 421 787 | -43 | -0,000035 | Kg-nivå; ikke materiell |
| 230641 | 2022 | 214 112 482 | 214 112 472 | -10 | -0,000005 | Kg-nivå; ikke materiell |
| 230641 | 2023 | 217 552 730 | 217 552 724 | -6 | -0,000003 | Kg-nivå; ikke materiell |
| 230641 | 2024 | 216 302 600 | 216 302 676 | 76 | 0,000035 | Kg-nivå; ikke materiell |
| 230649 | 2022 | 20 590 309 | 20 590 306 | -3 | -0,000015 | Kg-nivå; ikke materiell |
| 230649 | 2023 | 25 209 370 | 25 209 360 | -10 | -0,000040 | Kg-nivå; ikke materiell |
| 230649 | 2024 | 32 324 406 | 32 324 419 | 13 | 0,000040 | Kg-nivå; ikke materiell |

**Kontrolldom:** Uljas bekrefter Comtrade-previewens hovedtall. Rapsmel 230641 ligger fortsatt rundt 216 000 tonn/år i 2022-2024, soyamel 2304 ligger i intervallet 87-144 000 tonn/år, og Finland-1201 er liten sammenlignet med Norges bønnestrøm. Avvikene er så små at de bør behandles som kilde-/avrundings- eller revisjonsstøy, ikke som et reelt databrudd.

## 5. Claim-effekt for Valio-caset

Dette kan nå sies internt, med kilde/locator:

- Finland har et offentlig nasjonalt datagrunnlag for fôrsektorens produksjon/import og korn/proteinvekst-bruk. Det ligger hos Ruokavirasto, Luke og Tulli/Uljas.
- Finsk fôrsektor har betydelig import av fôrråvarer: Ruokavirasto viser 640,7 mill. kg fôrråvareimport i 2024 og 670,4 mill. kg foreløpig i 2025.
- Uljas bekrefter at soyaerstatningsrammen i Valio-fortellingen fortsatt er importavhengig på nasjonalt nivå: 230641-importen er 214,1 / 217,6 / 216,3 mill. kg i 2022-2024.
- Luke gir forbruksside-motvekt: f.eks. 2024/25-kornbalansen viser 1 540 mill. kg korn brukt som fôr, hvor bygg og havre er de største komponentene i de valgte kornartene.

Dette skal fortsatt **ikke** sies:

- Ikke si at Ruokavirasto/Luke-tallene er Valios fôrkurv.
- Ikke si at import er lik fôrbruk i melkekjeden.
- Ikke tolke blanke Luke-celler som null uten metodeavklaring.
- Ikke bruke GM-soyafiguren kvantitativt før tall er manuelt avlest eller kildefil er funnet.

## 6. Importbeslutning

Importer P-VALIO-1 som:

`deckklart internt for nasjonal Finland/Valio-systemramme; Valio-andeler fortsatt aktørgate; GM-soya chart-only; 2025 Uljas/Ruokavirasto med foreløpig caveat.`

PCQ/SRC-effekt:

- Legg Ruokavirasto 2025, Luke `vilvar`/`viltas` og Tulli/Uljas som kildekandidater for RP-02/Valio.
- Uljas-CSV-ene kan erstatte Comtrade-previewen for ekstern faktastemme etter ordinær source-shortlist/claim-lock.
- AASK for Valios egen fôrkurv/PFAD/A-Rehu forblir uendret.
