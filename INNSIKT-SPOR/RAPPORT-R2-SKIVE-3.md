# Rapport — Innsiktssporet runde 2, kjernelesning skive 3 av 8

**Status:** provisorisk — internt analysemateriale, ikke publiserbart
**Ekstraktfil:** `INNSIKT-SPOR/ekstrakt/kjerne-skive-3.jsonl` (15 poster, én per kilde)

## Lesetall

- **Kilder totalt tildelt skive 3:** 15
- **Lest fullt (`read_fully`):** 5
- **Lest delvis (`read_partially`):** 10
- **Ulest:** 0

De store PDF-ene (21 000–82 600 ord) er merket `read_partially` fordi jeg leste sammendrag/konklusjoner + de kapitlene som bærer tall (markedsstruktur, selvforsyning, EMV, margin, resultatavfall), ikke hver side. De korte .md/.txt-kildene og de to svenske markedsrapportene er lest fullt. Ingen kilde måtte hoppes over.

**Findings totalt:** 59 (fordelt på de 15 postene, 2–6 per kilde).

## Feltdekning (DATAGAP-felt som findings treffer)

| Felt | Kilder som bidrar |
|---|---|
| `beredskap_import` | Island-beredskap, Meld. St. 11, Riksrevisjonen, NKJ white paper |
| `materialstrommer` | Sigala (HORECA-svinn), van der Fels-Klerx (sirkulær matsikkerhet), Brancoli (brødsvinn SE), Meld. St. 11 (kraftfôr/matsvinn), Riksrevisjonen (oppdrettsfôr) |
| `makt_eierskap` | NOU 2011:4, Coop 2024, EMV-kartlegging 2023, Marginstudie 2024, NKJ (islandsk melk) |
| `offentlig_innkjop` | Ekomat 2022 (SE offentlig sektor 38 %), Ekomat 2024, Sigala, NKJ (København 84 %) |
| `okologi_jordhelse` | Ekomat 2024 (SE areal −16 %), Ekomat 2022, Riksrevisjonen (arealforvaltning), NKJ |
| `aktordybde` | Coop 2024, NOU 2011:4, Finland HBS, EMV-kartlegging |
| `lokale_verdikjeder` | Finland HBS (butikkavstand), Ekomat 2024, Meld. St. 11 (potet/grønt), Brancoli |
| `nordisk_dybde` | Island-beredskap, Meld. St. 11, Riksrevisjonen |
| `alternativt_protein` | Enorm Biofactory (dansk insektprotein-konkurs) |
| `kvalitativt_lag` | NKJ (helsegevinst-anslag) |

Tyngdepunktet i skive 3 er **norsk maktstruktur/verdikjede** (NOU 2011:4, Coop, EMV-kartlegging, Marginstudie) og **beredskap/selvforsyning** (Meld. St. 11, Riksrevisjonen, Island), med et **svensk økologi-/offentlig innkjøp-lag** (de to Ekomat-rapportene) og et **matsvinn/sidestrøm-lag** (Sigala, Brancoli, van der Fels-Klerx).

## Merknader om grunnlag (`basis`) og systemgrense

- **`aktoropplysning`/selvrapportering** dominerer i markedsandels- og innkjøpstallene: Coops 29,1 % dagligvareandel og 17,9 % EMV er selskapets egen rapportering; de svenske offentlig-sektor-tallene (38 % økologisk) er en spørreundersøkelse (84 % svarfrekvens). Merket deretter.
- **Kapasitet vs. realisert:** Enorm Biofactorys «10 000 tonn/år» er oppgitt kapasitet som aldri ble realisert — eksplisitt flagget i `systemBoundary`. Et sannsynlig fremtidig felt for feilsitering.
- **Selvforsyning har flere tall for samme størrelse:** dekningsgrad 39 % (2023), sjølvforsyningsgrad 45 % (2023), korrigert for fôrimport 34–40 % (Riksrevisjonen), politisk mål 50 %. Alle ligger i ekstraktene med separat `systemBoundary` slik at de ikke smelter sammen.
- **Modellerte tall** merket som sådan: NKJs 154 mrd. NOK helsegevinst, matsvinnpotensial 75 % (Meld. St. 11), Brancolis nasjonale 80 500 tonn brødsvinn (ekstrapolert), globale UNEP/Eurostat-svinntall hos Sigala.

## Registrert motstrid (`contradicts`)

- **EMV-andel over tid:** NOU 2011:4 måler 11,8 % (2010); EMV-kartlegging 2023 måler ca. 20 % (2022) hos de tre store. Ikke egentlig uenighet, men dokumenterer sterk vekst — registrert som contradicts på NOU-posten.

## Kilder som ikke lot seg lese

Ingen. Alle 15 PDF-/tekst-kilder lot seg konvertere med `pdftotext` og lese. De store PDF-ene ble lest målrettet (sammendrag + tallbærende kapitler) fremfor sidevis i sin helhet — derav `read_partially`. To kilder (NKJ white paper og de svenske Ekomat-rapportene) er DB-snapshot-artefakter, men inneholder full ekstern kildetekst (14 922 / 19 709 / 10 585 ord) og ble lest som primærtekst.

## Viktigste funn for syntesen

1. **Norsk selvforsyning er lav og fallende:** 39 % dekningsgrad / 45 % sjølvforsyningsgrad (2023, ned 1–2 pp), og bare 34–40 % korrigert for importert fôr — ~60 % av maten er importert eller basert på importert fôr (Riksrevisjonen). 90 % av oppdrettsfôret er importert.
2. **Sterk konsentrasjon, men Konkurransetilsynet avviser krisemargin-narrativet:** Marginstudien finner at kjedene ikke utnyttet 2022-prisveksten (11,5 %) til økt lønnsomhet, men konkluderer likevel med svak konkurranse og høye etableringshindre.
3. **EMV-vekst er dokumentert måling:** fra 11,8 % (2010) til ~20 % (2022) — et av de klareste kvantifiserte maktskiftene i materialet.
4. **Svensk økologi-kollaps som materialstrøm-signal:** −16 % økologisk areal (−98 000 ha) i 2023, drevet av lave merpriser til bønder — et konkret sidestrøm-/jordhelse-funn med målt basis.
5. **Type C-hull bekreftet:** ingen av kildene måler realiserte lokale/nordiske materialstrømmer i tonn; selvforsynings- og svinntall er dels modellerte/ekstrapolerte, og volum bak verditallene i offentlig innkjøp mangler gjennomgående.
