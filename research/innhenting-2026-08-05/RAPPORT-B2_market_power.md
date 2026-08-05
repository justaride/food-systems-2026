# RAPPORT — B2_market_power (Innhentingssesjon 2026-08-05)

Skive: markedsmakt / konsentrasjon / marginer i norsk og nordisk dagligvare + håndheving.
Innhenter: B2_market_power. Alt landet kun i `research/innhenting-2026-08-05/`.

## Sammendrag av innhenting

- Manifestrader: 20
- **fetched_full: 17** (9 PDF-rapporter + 8 HTML/pressemeldinger/akademisk)
- **metadata_only: 2** (NCA indekssider — lenkeoversikter, ingen egne datapunkter)
- **paywalled: 0**
- **dead_link: 1** (Aftenposten-raden hadde tom URL i manifestet — ikke gjettet)
- **Findings totalt: 44** (over 18 kilder med data)

Ingen paywall truffet. Alle direkte-PDF-er (9) lastet OK (application/pdf verifisert), konvertert med `pdftotext`. Alle 10 landingssider ga http 200. Én URL i manifestet merket `landing_html` (nordicopenaccess) viste seg å være en PDF og ble hentet/konvertert som PDF.

## Kilder hentet (utvalg med tyngste tall)

**Primærevidens (regulator/offisiell):**
- NCA pressemelding + OECD-rapport: gebyr 4,9 mrd NOK (NG 2,3 / Coop 1,3 / Rema 1,3) for prisjeger-samarbeid 2011–2018; tre kjeder = **95 %** av omsetning.
- NCA Dagligvarerapport 2024 (PM + full rapport): markedsandeler 2024 **NG 43,5 % / Coop 29,2 % / Rema 23,9 % / Bunnpris 3,3 %** (tradisjonell fysisk dagligvare, ekskl. netthandel — avviker fra NielsenIQ). Tine mottar **93 %** av leveransene fra norske melkebønder.
- NCA Marginstudie 2024 del 1 & 2: detaljist driftsmargin **<5 %** (<3 % utenom pandemiår), grossist **~1 %**; RNOA signifikant over normal → konsistent med svak konkurranse + etableringshindringer; EMV-bruttomarginer **~12 prosentpoeng** lavere enn merkevarer; matprisvekst 11,5 % (2022) + 8,9 % (2023) (SSB).
- NCA innkjøpspris-PM: NG får lavere innkjøpspriser enn Coop/Rema, forskjeller synkende 2017–2024 — **størrelsen holdes tilbake (forretningssensitivt)** → notMeasured.
- Menon 177/2024 (grossisttjenester, for NFD): tre integrerte grossister (ASKO, REMA Distribusjon, Coop Distribusjon); integrerte fullsortimentsgrossister eneste konkurransedyktige kanal, betydelige etableringsbarrierer; ingen påvist markedssvikt.
- Pettersen & Steen 2020 (NIBIO/NHH, akademisk, CC BY-ND): nordisk konsentrasjon — S-gruppen 46,4 % (FI), ICA 51,5 % (SE); norsk matpris 32 % over naboland (2017); skjermingsstøtte 47 % vs 5 % SE/DK.
- Konkurrensverket 2025:5 (SE): evaluering av LOH/UTP — dagligvaruhandeln tar høyere andel av risk til leverandørenes fordel; inga mätbara effekter på lokal handel.
- Lovdata forskrift 601: lov 129/2025 i kraft 30.04.2026; Dagligvaretilsynet avvikles 30.04.2026.

**Sekundær / media (bærer aktoropplysning, ikke maalt):**
- NIELS/Butler (juridisk analyse av vedtaket); Regjeringen PM (oppsummerer Menon); Nationen/NTB (NG oppgir ~3 % resultatmargin, bestrider svak konkurranse); Okologisk24 (EMV **~20 %** 2022 vs 17 % 2017; industriandel NG 66 %).
- Menon/Virke 2018: **partsinnlegg** for Virke som argumenterer *mot* svak-konkurranse-hypotesen — driftsmargin 2007–2016: butikker 1,9 %, grossist 2,2–2,9 %, produsent 3,6 %. Merket sourceKind=secondary med advarsel i `limitations`.

## Felt dekket (fillsGap)

`makt_eierskap` (dominerende), `nordisk_dybde`, `aktordybde`, `kausalitet`, `lokale_verdikjeder`, `beredskap_import`, `kvalitativt_lag`.

## Proveniens-disiplin

- Konsentrasjons- og margintall fra NCA/regnskap merket `maalt` med `systemBoundary` (f.eks. «tradisjonell fysisk dagligvare, ekskl. netthandel», «driftsmargin per ledd 2017–2022»). Regulatorvurderinger merket `modellert`. Media/aktøruttalelser merket `aktoropplysning`.
- Sentral fallgruve fanget: NCA-markedsandeler (fysisk butikk) vs NielsenIQ (inkl. netthandel) er ulike systemgrenser — notert på raden.
- Tilbakeholdt tall (innkjøpsprisforskjell-størrelse) logget som `notMeasured`, ikke gjettet.

## Ikke hentet / for senere

- Aftenposten «Leverandører redd for dagligvarekjedene (KPMG-oppsummering)» — manifest hadde tom URL. Logget `dead_link`; trenger URL-oppsporing i senere runde (ikke lagt i OPPDAGET-KØ da det er en backlog-rad uten lenke).
