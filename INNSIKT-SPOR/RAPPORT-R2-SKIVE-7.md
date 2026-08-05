# Rapport R2 — Skive 7 av 8 (kjernelesing)

**Status:** provisorisk — internt analysemateriale, ikke publiserbart
**Ekstraktfil:** `INNSIKT-SPOR/ekstrakt/kjerne-skive-7.jsonl` (15 poster, 43 findings)
**Lest:** 2026-08-05

## Lesestatus

| | Antall |
|---|---:|
| Kilder totalt i skive 7 | 15 |
| Lest fullt (`read_fully`) | 9 |
| Lest delvis (`read_partially`) | 6 |
| Ulest | 0 |
| Findings totalt | 43 |

De delvis leste er de fire store PDF-ene (ortiz-cuadra 96s, axfood 159s, kfst-salling 76s, nordic-food-markets 137s, matsvinnutvalget 176s) der jeg leste sammendrag, metode og de tallbaerende seksjonene men ikke hver side, pluss `src-159.md`. To fullt-leste kilder baerer null findings (se under).

## Feltdekning (findings per felt)

makt_eierskap 20 · materialstrommer 15 · nordisk_dybde 11 · aktordybde 9 · okologi_jordhelse 7 · lokale_verdikjeder 5 · kausalitet 4 · beredskap_import 4 · offentlig_innkjop 4 · kvalitativt_lag 4 · alternativt_protein 3

Skiva er tung paa **makt_eierskap** (nordiske markedsandeler/margin/konsentrasjon) og **materialstrommer** (matsvinn-MFA-er).

## Viktigste substansfunn

- **Matsvinn med ulik systemgrense:** Dansk MST (2017) oppgir 716 000 t/aar *unngaaelig* matsvinn (modellert MFA, UK WRAP-andeler brukt); norsk matsvinnutvalg (2021) oppgir 450 000 t *kartlagt* matsvinn (teller fra hoeste-/slaktetidspunkt, inkluderer mat til dyrefoer). Registrert som `contradicts` begge veier — totalene er **ikke** direkte sammenlignbare.
- **Type C-hull, Island oekologisk:** Island har ingen offentlige tall for oekologisk markedsandel eller importvolum av oekologiske varer («liggja ekki fyrir»). Sterkt «det ingen maaler»-funn.
- **Islandsk NPK (r4-05):** eneste harde element-basis maaletall i skiva (Hagstofa LAN10001), men baaren av et prosjekt-uttrekk. Behandlet som primaeruttrekk fordi det har full lokator til primaerkilden; flagget i `limitations`.
- **Alternativt protein:** ENORM-konkursen — 11 000 t er *designkapasitet*, ikke realisert volum. Klassisk systemgrense-felle, flagget.
- **Finske markedsandeler (PTY 2023):** S Group 48,3 %, K Group 34,3 %, Lidl 9,6 % — aktoropplysning fra NielsenIQ.

## Kilder uten baarende findings ( aerlig oppfoering)

- `document:cmq8rsnhe000iekvmxetvdbw4` (**external-luke-food-balance-2024.md**): metadata-only remediation-snapshot. Selve balansetallene er ikke importert til dokumentet — kun PxWeb-tabellbeskrivelse. Ingen tall aa baere. FI selvforsyningstall maa hentes direkte fra Luke PxWeb.
- `document:cmqgiocwc00lz4nvmmroj70d4` (**src-159.md**): duplikat av external-mst-denmark (samme kanoniske PDF, 978-87-93529-80-9). Tallene foert under external-mst-posten for aa unngaa dobbelttelling.

## Basis-fordeling (kvalitetsnote)

- `maalt`: Islandsk NPK (Hagstofa), KPI mat (SSB/Eurostat), EU oekologisk-andel (Eurostat).
- `modellert`: alle matsvinn-volumtall (dansk MST-MFA, norsk matsvinnutvalg) — eksplisitt flagget som avledet, ikke maaling.
- `aktoropplysning`: markedsandeler, marginer, aarsrapporttall, surveyer, journalistikk.
- `ikke_oppgitt`: Islands oekologiske data (finnes ikke), Makelas 46 %-sekundaersitat.

Ingen `internal_synthesis`-kilde baerer et tall. Det eneste prosjekt-produserte notatet (r4-05) er baaret av primaerlokator til Hagstofa og eksplisitt flagget.

## Kilder som ikke lot seg lese

Ingen. Alle 15 lot seg lese (PDF via `pdftotext`, .md direkte).
