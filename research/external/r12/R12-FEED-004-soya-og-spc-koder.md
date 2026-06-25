---
id: R12-FEED-004
tittel: Soya og SPC-koder
status: Intern research-output - ingen claims
dato: 2026-06-24
gate: PCQ
---

# R12-FEED-004 - Soya og SPC-koder

## Kort dom

SSB 08801 gir et godt primæranker for norske importkoder som er relevante for soyafôr og proteinkonsentrater, men kodene må ikke blandes. `23040010` dekker oljekaker/faste reststoffer etter utvinning av soyaolje til dyrefôr, mens SSBs `21061002` og `21061003` dekker proteinkonsentrater og teksturerte proteinsubstanser til henholdsvis fiskefôr og annet dyrefôr fra 2022. Sluttbruk etter importør, art/fôrresept og om et konkret produkt er soy protein concentrate (SPC) er fortsatt et C-/aktørhull uten produkt- eller importørdata.

## Sterkeste kilde

- SSB 08801 API/metadata, 2026-06-24 kontrollert mot varenummertekst for `12019010`, `12081010`, `21061002`, `21061003` og `23040010`.
- UNSD HS 2012 klassifikasjon for `210610` som protein concentrates and textured protein substances.
- Landbruksdirektoratet, Omverdenen til norsk landbruk og matindustri 2024, for kontekst om soyamel/rapsmel som proteinråvarer.

## Svakeste punkt

Tollkode er ikke det samme som sluttbruk i en faktisk fôrresept. SSB skiller enkelte fôrformål i varenummerteksten, men viser ikke importør, kontrakt, resept, art, produksjonstype eller om proteinkonsentratet er soya, ert, hvete eller blanding hvis varenummeret er bredere enn produktspesifikasjonen.

## Funn-tabell

| Indikator/kode | År/periode | Lokator | Kildeklasse | Status | Caveat |
|---|---|---|---|---|---|
| `12019010_2012` - soyabønner, også knuste, til dyrefôr | 2012- | SSB 08801 `Varekoder` | A | Importkode finnes | Rå soyabønne, ikke SPC og ikke soyamel. |
| `12081010_1995` - soyabønnemel til dyrefôr | 1995- | SSB 08801 `Varekoder` | A | Importkode finnes | Mel av soyabønner, ikke nødvendigvis samme vare som oljekake/reststoff i 2304. |
| `23040010_1995` - oljekaker/faste reststoffer etter utvinning av soyaolje, til dyrefôr | 1995- | SSB 08801 `Varekoder` | A | Kjerneanker for soyamel/oljekake-sporet | Ikke SPC; ikke skill fiskefôr/annet dyrefôr i denne koden. |
| `21061002_2022` - proteinkonsentrater og teksturerte proteinsubstanser til fiskefôr | 2022- | SSB 08801 `Varekoder` | A | SPC-nært kodeanker for fiskefôr | Varenummeret sier protein concentrate/textured protein, ikke soyakilde per se. |
| `21061003_2022` - proteinkonsentrater og teksturerte proteinsubstanser til dyrefôr, unntatt fiskefôr | 2022- | SSB 08801 `Varekoder` | A | SPC-nært kodeanker for annet dyrefôr | Bred råvarekategori; sluttbruk og råvareart må ikke gjøres ferdig. |
| HS `210610` | Gjeldende HS-struktur | UNSD classification detail | A | Overordnet HS-anker | HS6 er bredere enn norsk varenummer og bredere enn soy-SPC. |
| Soyamel/rapsmel som proteinråvarer i norsk kraftfôr | 2024 | Landbruksdirektoratet rapport 2/2025 | A | Kildeanker for fôrprotein-kontekst | Kilde omtaler forbruk/råvarer, ikke full importør- eller SPC-splitt. |
| Sluttbrukssplitt per importør/art/fôrresept | 2022-2025 | Ikke funnet som åpen primærserie | C | Tom celle | Krever aktørdata, fôrprodusentdata eller mer detaljert importør-/produktklassifisering. |

## Kontrollert SSB-uttrekk

API-kontroll ble kjørt som import, `Mengde1`, alle land summert per kode, for 2022-2025. Dette er et arbeidsanker for PCQ, ikke et ferdig claim.

| Kode | 2022 kg | 2023 kg | 2024 kg | 2025 kg | Caveat |
|---|---:|---:|---:|---:|---|
| `12019010_2012` | 184664 | 89560 | 47520 | 44000 | Soyabønner til dyrefôr. |
| `21061002_2022` | 0 | 0 | 747850 | 1420980 | Proteinkonsentrater/teksturerte proteinsubstanser til fiskefôr; ikke produktart. |
| `21061003_2022` | 932 | 96 | 87 | 97 | Proteinkonsentrater/teksturerte proteinsubstanser til annet dyrefôr; svært liten registrert mengde i uttrekket. |
| `23040010_1995` | 6298381 | 1952770 | 4813074 | 13376280 | Soyabaserte oljekaker/reststoffer til dyrefôr; ikke SPC. |

## Tomme celler

- Åpen primærserie som skiller SPC fra andre proteinkonsentrater innen `21061002/03`.
- Åpen primærserie som kobler importerte proteinkonsentrater til fiskefôrprodusent, fôrresept eller art.
- Åpen primærserie som skiller norsk husdyrfôr og fiskefôr for `23040010`.
- Åpen dokumentasjon av om enkelte importerte SPC-volumer er mat, husdyrfôr, fiskefôr eller annen industri.

## Ikke si

- Ikke si at SPC er HS `2304`.
- Ikke si at `210610` alltid er soya-SPC.
- Ikke si at SSB importkode beviser faktisk sluttbruk i laks, gris, fjørfe eller melk.
- Ikke bland soyabønner, soyabønnemel, soyaolje, soyamel/oljekake og proteinkonsentrat.
- Ikke bruk SSB-kilo som fôrforbruk uten lager, re-eksport, svinn og produksjonsdata.

## Anbefalt gate

PCQ. Importer kodeledgeren som kildeanker og C-hull. Eventuelle tallformuleringer må låses smalt til SSB-kode, år, import/eksport, mengdeenhet og caveat.

## Kilder sjekket

- https://data.ssb.no/api/v0/no/table/08801
- https://www.ssb.no/utenriksokonomi/utenrikshandel/artikler/import-og-eksport-alle-land-og-varenummer
- https://unstats.un.org/unsd/classifications/Econ/Detail/EN/32/210610
- https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Omverdenen%20til%20norsk%20landbruk%20og%20matindustri%20-%20rapport%20for%202024%20Rapport%202%202025.pdf
