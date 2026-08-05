# Rapport — Innsiktssporet runde 2, kjerne-skive 1 av 8

**Status:** provisorisk — internt analysemateriale, ikke publiserbart
**Leser:** kjernelesser skive 1 (innsikt-runde-2)
**Ekstraktfil:** `INNSIKT-SPOR/ekstrakt/kjerne-skive-1.jsonl` (14 linjer, validert JSON)

## Lesetall

| | Antall |
|---|---:|
| Kilder i skiven | 14 |
| Lest fullt | 5 |
| Lest delvis | 9 |
| Ulest | 0 |
| Findings totalt | 40 |

**Lest fullt** (korte .md-kilder, lest ord for ord): kfst-ok-coop (DK), SSB Norge–Brasil handelsuttrekk, Ekomatcentrum (SE), Jordbruksverket ekologisk växtodling 2024, Debio statistikk 2024.

**Lest delvis** (store PDF-er + akademiske oppgaver — sammendrag, metode og de substanstunge kapitlene lest via pdftotext, ikke hele dokumentet): Menon funksjonelt skille (66 s.), Prisjusteringsvinduer (Konkurransetilsynet, 44 s.), Adlers 2022, Kayhan-Rönnbäck 2019, src-161 Nordic circular (Nordisk ministerråd), Nilsen-Paulsen 2025, van-Straten 2025, SOU 2024:8 (364 s.), Landbruksarena-transkript. For de tre største (SOU 2024:8, src-161, van-Straten) ble kildene mållest på de mat-/beredskaps-/materialstrøm-relevante seksjonene; verdikjede- og markedskapitlene i Menon og Prisjust ble lest i sin helhet.

## Feltdekning (findings per felt)

| Felt | Findings |
|---|---:|
| makt_eierskap | 12 |
| beredskap_import | 11 |
| materialstrommer | 9 |
| okologi_jordhelse | 8 |
| nordisk_dybde | 7 |
| kausalitet | 4 |
| aktordybde | 4 |
| offentlig_innkjop | 3 |
| kvalitativt_lag | 1 |
| lokale_verdikjeder | 1 |

Skiven er tung på **makt_eierskap** (norsk dagligvarestruktur: Menon 2026, Prisjust 2023, Kayhan) og **beredskap_import** (SOU 2024:8 + SSB soyauttrekk). De tre gulv-utsatte feltene er tynt representert også her: alternativt_protein har 0 findings i skiven, kvalitativt_lag og lokale_verdikjeder kun 1 hver (van-Straten, kvalitativ Finland-case).

## Basis-fordeling (viktigste kvalitetsdimensjon)

- **maalt:** SSB-tollstatistikk (soya/klippfisk), Jordbruksverket JO0114, Debio-arealtall, svensk mineralgjødsel-nettoimport (~750 000 t/år), norsk KPI-mønster. Disse er reelle målinger fra offisielle registre/toll.
- **modellert:** Nilsen-Paulsen pass-through (økonometri — markert eksplisitt så et modellert pass-through-tall ikke senere siteres som måling), SOU-kostnadsanslag (~1 mrd SEK/år), src-161 matsvinnandeler (siterte globale estimater).
- **aktoropplysning:** markedsandeler (NIQ/DLF/ICA-tall via Menon/Kayhan/SOU), Ekomatcentrum-tall (advokerende org.), politiske måltall, SOU-opprinnelsesland.
- **ikke_oppgitt:** EMV-andel ~20 % (Menon oppgir ikke grunnlag), regulatoriske vurderingskonklusjoner (Menon/Prisjust).

## Motsetninger fanget (contradicts)

1. **Nordisk økologi-gap:** Sverige 16,6 % økologisk areal og fallende (-19 % siden 2019, Jordbruksverket) vs. Norge 4,3 % og stabilt (Debio) — nær firedobbel nivåforskjell, motsatt trend.
2. **Brasiliansk soyaavhengighet:** SOU 2024:8 (Brasil+Canada viktigst for svensk sojamjøl 2022) vs. SSB (Brasils andel av norsk soyaimport høy men fallende, 69,8 % i 2024). Samme avhengighet, ulik landtrend — verdt å forfølge i beredskap_import og materialstrommer.
3. **Terskel for regulatorisk inngrep:** Konkurransetilsynet (2023) mener prisjusteringssystemet sannsynligvis var konkurransebegrensende; Menon (2026) finner ikke vertikale konkurranseproblemer sterke nok til å kreve skille.

## Merknader og forbehold

- Ingen skriving til `knowledge/corpus/`, registeret, køer eller database. Kun `INNSIKT-SPOR/ekstrakt/kjerne-skive-1.jsonl` og denne rapporten.
- **SSB-uttrekket** er operert av prosjektet mot SSBs offisielle PxWebApi. Tallene er SSBs egne målte tollstatistikk (basis: maalt), ikke intern syntese — men det er et prosjekt-generert uttrekk, så primærkilden bør oppgis som SSB tabell 08801 med de siterte varekodene. 2025-tall er foreløpige.
- **Landbruksarena** er en auto-transkribert seminarvideo: muntlige surveytall er upresise i transkripsjonen og ble bevisst IKKE tatt inn som findings-verdier; kun policy-/tilstandsfunnet (frivillige tiltak → lokale krav, uteblitt Oslofjord-effekt) er registrert.
- Sidetall for SOU 2024:8 og andre store PDF-er er delvis omtrentlige (pdftotext-linjeposisjoner brukt der trykte sidetall ikke var entydige).
- Ingen kilder lot seg ikke lese; alle 14 ble åpnet og prosessert.
