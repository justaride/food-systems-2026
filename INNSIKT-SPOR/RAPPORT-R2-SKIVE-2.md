# Rapport — Innsiktssporet runde 2, skive 2 av 8

**Status:** provisorisk — internt analysemateriale, ikke publiserbart
**Kjernelesser:** innsikt-runde-2 (skive 2)
**Ekstraktfil:** `INNSIKT-SPOR/ekstrakt/kjerne-skive-2.jsonl` (16 poster, én per kilde)

## Lesetall

| | Antall |
|---|---:|
| Kilder totalt i skive 2 | 16 |
| Lest fullt (`read_fully`) | 14 |
| Lest delvis (`read_partially`) | 2 |
| Ulest | 0 |
| Findings totalt | 50 |

De to delvis leste er de største PDF-ene, lest via målrettet søk på nøkkelfigurer (sammendrag, hovedtabeller, metode), ikke lineært:
- `document:cmp8xynwg00iwvvvmpfjozebw` — Kesko Annual Report 2024 (277 sider / ~127 000 ord)
- `document:cmp8xyops00kkvvvmnhgrwt2t` — NIBIO Selvforsyningsgrad 2026 (124 sider + 17 vedlegg)

Én kilde ga null findings: `document:cmppajyru0009njvmavxrd7cp` (desilva-2023) — fila er kun et 55-ords lokator-notat; fulltekst ble aldri fanget (nedlasting returnerte HTML). Lest fullt, men ingen substans å ekstrahere. Manifestets felt-tagger for denne kilden hviler ikke på lesbar tekst.

## Grunnlag (`basis`) på tvers av 50 findings

| basis | Antall | Merknad |
|---|---:|---|
| `aktoropplysning` | 30 | Selskapers egne rapporttall, politiske anførsler, nasjonale offisielle SG-tall |
| `modellert` | 10 | NIBIOs SG-omregninger, Blue Empire-modellering, Fretheim/Martens-økonometri, Reitans offsite-matsvinn, EU-matsvinnprognose, Mattilas CO2-anslag |
| `maalt` | 10 | SLU-krikketforsøk, ASKO/EMC-innkjøpsstatistikk, Mattilas svinnpilot, NordicFeed-fôrforsøk |

**Viktigste basis-flagg (fremtidig skandale-risiko):**
- **Reitan Retails offsite-matsvinn er modellert**, ikke målt — beregnet som nasjonal matsvinnstatistikk × markedsandel. Kun onsite-svinn er selvmålt.
- **NIBIOs selvforsyningstall for andre land er modellerte omregninger** med norsk metode på FAO-data — IKKE landenes egne offisielle tall. Ethvert av disse tallene (Sverige 47-49 %, Danmark 63-64 %, Finland 58 %) som senere siteres som «landets selvforsyningsgrad» ville være en feilsitering.
- **Blue Empires villfisk-/frigjøringstall («~2 mill. tonn», «~1 mill. tonn frigjort»)** er egne modelleringer fra en interesseorganisasjon, ikke sporbar måling.

## Feltdekning (findings tagget per DATAGAP-felt)

| Felt | Findings |
|---|---:|
| materialstrommer | 20 |
| nordisk_dybde | 14 |
| beredskap_import | 13 |
| makt_eierskap | 10 |
| offentlig_innkjop | 9 |
| kausalitet | 8 |
| aktordybde | 6 |
| alternativt_protein | 5 |
| okologi_jordhelse | 5 |
| lokale_verdikjeder | 3 |
| kvalitativt_lag | 0 |

Skiven treffer alle felt unntatt `kvalitativt_lag` (Reitan-rapporten var manifest-tagget for det, men de leste delene bar ingen påstand om det menneskelige laget som tålte lokator).

## Motsigelser (`contradicts`, 5 stk.)

Den mest verdifulle: **NIBIO 2026 vs. SLU-Eriksson 2016 om svensk selvforsyning** — Eriksson oppgir ~55-60 %, NIBIO får 47-49 %. NIBIO-rapporten demonstrerer nettopp hvorfor: selvforsyningsgrad er sterkt metodeavhengig (energi/kalori vs. produkt/verdi, brutto vs. netto fôrkorreksjon). Dette er ikke to feil tall, men to definisjoner — og et direkte funn for `beredskap_import`/`nordisk_dybde`.

Øvrige: Fretheim (Rema 23,2 % i 2019) vs. Reitan (~23,8-23,9 % i 2024); Blue Empire (trimmings-basert fôr) vs. NordicFeed (mikrobielt fôr) som konkurrerende løsningsnarrativ; importvern-flertall vs. -mindretall i Innst. 130 S.

## Det ingen måler (utvalg fra 27 `notMeasured`-punkter)

- **Realisert selvforsyning/matsikkerhet under krise:** NIBIO understreker at SG ikke måler matsikkerhet; beredskapslagre og krisescenarier måles ikke. Finlands NESA-program er ren governance uten kvantifisert selvforsyningstall.
- **Absolutt matsvinnvolum:** Både ASKO (kun %-reduksjon) og Kesko (kun matsvinn*prosent*) unnlater å oppgi absolutt tonn; Reitan modellerer det. Ingen nordisk sammenlignbar absoluttmåling.
- **Industriell gjennomstrømning av alternativt protein:** NordicFeed og SLU-krikketavhandlingen måler forsøks-/laboratorieskala; ingen måler kommersielt produsert volum av mikrobielt/insektprotein i Norden.
- **Sporbar volumstrøm i fôrkjeden:** Blue Empire aggregerer modellerte anslag; faktisk sporbar strøm fra vestafrikanske havner til navngitte norske fôrfabrikker er umålt (rapporten sier det selv).

## Merknad om kildetyper

Fem av 16 kilder er lokale «snapshot»-filer (HTML-tekstuttrekk av eksterne primærkilder lagret i DB-en), ikke selve PDF-ene: blue-empire, nesa, nordicfeed, slu-eriksson, og de to ekomatcentrum-filene. Innholdet er ekstern primærtekst og er behandlet som primærkilde med lokator, men flere av dem er korte web-utdrag (nesa/nordicfeed er nær ren governance/prosjektbeskrivelse med lite kvantitativ substans). Ingen `internal_synthesis`-kilde bærer et tall i denne skiven.
