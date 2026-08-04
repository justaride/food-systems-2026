# Rapport R2 – Skive 0 av 8

**Status:** provisorisk — internt analysemateriale, ikke publiserbart
**Kjernelesser:** innsikt-runde-2, skive 0
**Ekstraktfil:** `INNSIKT-SPOR/ekstrakt/kjerne-skive-0.jsonl`

## Lesetall

| | Antall |
|---|---:|
| Kilder i skive 0 | 13 |
| Lest fullt | 6 |
| Lest delvis | 7 |
| Ulest | 0 |
| Findings totalt | 47 |

**Lest fullt** (hele tilgjengelig innhold sett): van-leeuwen-2024, nhh-food-steen-2024, jcleprod-norwegian-seafood-sd-2025 (kun abstract/metadata finnes lokalt), slu-karimi-vinasse-2019, usda-gain-iceland-2023, landbrukarena-transkript-11.

**Lest delvis** (store dokumenter – lest sammendrag/innledning/metode/nøkkeltabeller, skummet resten): khandaker-2021, stahl-2024, zakeri-lei-2024, coop-danmark-2024, is-esa-iceland-2023, prisjeger-saken-2024 (~500 s.), halseth-nhh-2023.

Ingen kilder lot seg ikke lese. To .md-kilder (halseth, karimi) og én .md (iceland) hadde ekstremt lange enkeltlinjer som sprengte token-grensen ved direkte Read; løst ved å reflytere til 110-120 tegns linjer og lese derfra. `pdftotext` fungerte for alle PDF-er.

## Feltdekning

Findings dekker 10 av 11 DATAGAP-felt: `makt_eierskap`, `aktordybde`, `materialstrommer`, `beredskap_import`, `nordisk_dybde`, `okologi_jordhelse`, `alternativt_protein`, `offentlig_innkjop`, `lokale_verdikjeder`, `kausalitet`. (`kvalitativt_lag` er tagget i skive-manifestet for zakeri/landbruk, men de faktiske findings landet primært under aktordybde/kausalitet; landbruk-transkriptet er rent kvalitativt uten målbare påstander.)

Tyngdepunkt: `makt_eierskap` (7 kilder) og `beredskap_import` (6 kilder). Skiva er sterk på nordisk dagligvarestruktur/konsentrasjon (NO, SE, DK, IS) og selvforsyning/beredskap.

## De tyngste, best forankrede tallene

- **Prisjeger-vedtaket V2024-4 (Konkurransetilsynet)**: Coop/NorgesGruppen/Rema samlet >95 % markedsandel; overtredelsesgebyr Coop 1,321 mrd, NG 2,313 mrd, Rema/Reitan 1,293 mrd kr. `aktoropplysning`/`maalt`, med avsnittslokator.
- **Halseth (NHH 2023)**: økonometrisk – nasjonal HHI 0,25→0,33 (2002→2016), median lokal HHI = 1,0 (monopol), norske matpriser ~50 % over EU-snitt. `maalt`.
- **Coop Danmark 2024**: revidert regnskap – nettoomsetning 33 618 mio. kr, 569 butikker, ny eier OK a.m.b.a. `aktoropplysning`.

## Grunnlag (basis) – advarsler

- `jcleprod-norwegian-seafood-sd-2025` er en **modellstudie**; kun abstract finnes lokalt. Alle tall herfra må merkes `modellert`, aldri måling.
- NHH-Steens landbruksstøtte «~25 mrd kr/år / 830 000 kr per årsverk» er merket `modellert` (estimat, budsjett + skjermingsstøtte), ikke måling.
- Khandakers moellekapasitet (900 000 tonn) er eksplisitt **kapasitet**, ikke gjennomstrømning – markert i `systemBoundary`.
- Karimi-proteintallene (44,7–57,6 %) er `maalt`, men på **laboratorieskala** (rystekolber), ikke industriell/nordisk produksjon.

## Motsetninger (contradicts)

Registrert reell uenighet mellom to kilder i skiva: **NHH-FOOD/Steen (2024)** nedtoner at norsk dagligvare er vesentlig mer konsentrert enn Norden, mens **Konkurransetilsynets vedtak V2024-4** fastholder at markedet er høyt konsentrert (>95 % hos tre aktører) og sårbart for konkurransebegrensning. Fylt begge veier i ekstraktene.

## Det ingen måler (utvalg fra notMeasured)

- van-Leeuwen: forekomst/skjebne av kjemiske farer (PFAS, legemidler, tungmetaller) i biprodukter og resirkulerte fôrstrømmer er systematisk ukartlagt i EU.
- Coop Danmark og USDA-GAIN Iceland: ingen næringsstrøms-/N-P-K-/sidestrømstall; ingen selvforsyningsgrad i prosent for Island.
- Prisjeger: den samlede prisvirkningen for forbrukerne av samarbeidet er ikke kvantifisert (partene anførte dette selv).

## Merknader

- Ingen skriving til `knowledge/corpus/`, registeret, køer eller databasen. Kun til `INNSIKT-SPOR/ekstrakt/` og denne rapporten.
- Alle poster er merket `provisional: true`, `producedBy: innsikt-runde-2`.
